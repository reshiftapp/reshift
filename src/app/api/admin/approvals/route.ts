import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email/brevo'

export const dynamic = 'force-dynamic'

async function verifySuperAdmin() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    return user.email === 'reshiftapp@gmail.com' || user.user_metadata?.role === 'super_admin'
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const isAuthorized = await verifySuperAdmin()
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Forbidden. Super Admin privilege required.' }, { status: 403 })
    }

    const { data: userList, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 })

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    // Filter ONLY users who explicitly registered as staff / volunteers.
    // Flutter mobile app customers MUST NOT appear here.
    const staffUsers = userList.users.filter((u) => {
      const meta = u.user_metadata || {}
      // Super admin is not an applicant
      if (meta.role === 'super_admin' || u.email === 'reshiftapp@gmail.com') return false

      // Only staff applicants who have registered through staff portal
      return (
        meta.is_staff === true ||
        Boolean(meta.id_card_url) ||
        Boolean(meta.idCardUrl) ||
        (Boolean(meta.approval_status) && meta.approval_status !== 'customer')
      )
    })

    const applications = staffUsers.map((u) => {
      const meta = u.user_metadata || {}
      return {
        id: u.id,
        email: u.email,
        fullName: meta.full_name || 'Anonymous Applicant',
        mobileNumber: meta.mobile_number || 'N/A',
        idCardUrl: meta.id_card_url || meta.idCardUrl || null,
        approvalStatus: (meta.approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
        rejectionReason: meta.rejection_reason || null,
        role: meta.role || meta.requested_role || 'volunteer',
        city: meta.city || 'Kochi',
        createdAt: u.created_at,
        isSuperAdmin: false,
      }
    })

    return NextResponse.json({ success: true, applications })
  } catch (error: any) {
    console.error('Error fetching approval applications:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await verifySuperAdmin()
    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Forbidden. Super Admin privilege required.' }, { status: 403 })
    }

    const { action, userId, assignedRole, reason } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ success: false, message: 'User ID and action are required.' }, { status: 400 })
    }

    const { data: userRecord, error: fetchErr } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (fetchErr || !userRecord?.user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    const user = userRecord.user
    const currentMeta = user.user_metadata || {}
    const userEmail = user.email || ''
    const userName = currentMeta.full_name || 'ReShift Volunteer'

    if (action === 'approve') {
      const role = assignedRole || currentMeta.requested_role || 'moderator'

      // Update auth metadata
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentMeta,
          approval_status: 'approved',
          role: role,
          approved_at: new Date().toISOString(),
        },
      })

      if (updateErr) {
        return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 })
      }

      // Send Brevo confirmation email
      await sendApprovalEmail({
        toEmail: userEmail,
        recipientName: userName,
        role,
      })

      return NextResponse.json({
        success: true,
        message: `Application approved! ${userName} has been assigned the role '${role}'.`,
      })
    } else if (action === 'reject') {
      const rejectionReason = reason?.trim() || 'Verification documents could not be validated.'

      // Update auth metadata
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...currentMeta,
          approval_status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
        },
      })

      if (updateErr) {
        return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 })
      }

      // Send Brevo rejection notice
      await sendRejectionEmail({
        toEmail: userEmail,
        recipientName: userName,
        reason: rejectionReason,
      })

      return NextResponse.json({
        success: true,
        message: `Application rejected. Notice sent to ${userEmail}.`,
      })
    } else if (action === 'delete') {
      // Permanent Protection: Target cannot be Super Admin
      if (user.email === 'reshiftapp@gmail.com' || currentMeta.role === 'super_admin') {
        return NextResponse.json({ success: false, message: 'Super Admin root account cannot be deleted.' }, { status: 403 })
      }

      // Delete from public.profiles if exists
      await supabaseAdmin.from('profiles').delete().eq('id', userId)

      // Permanently delete user from Supabase Auth
      const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (deleteErr) {
        return NextResponse.json({ success: false, message: deleteErr.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Account ${userName} (${userEmail}) has been permanently deleted from database.`,
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 })
  } catch (error: any) {
    console.error('Approvals update error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal error' }, { status: 500 })
  }
}
