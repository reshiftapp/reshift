import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// Whitelist of valid storage buckets
const ALLOWED_BUCKETS = [
  'id-cards',
  'property-images',
  'food-images',
  'event-images',
  'carousel-banners',
  'avatars',
]

// Whitelist of allowed MIME types and their safe extensions
const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

// Max file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const requestedBucket = (formData.get('bucket') as string) || 'property-images'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 1. Validate bucket against whitelist
    if (!ALLOWED_BUCKETS.includes(requestedBucket)) {
      return NextResponse.json(
        { error: `Invalid bucket: '${requestedBucket}'. Allowed buckets: ${ALLOWED_BUCKETS.join(', ')}` },
        { status: 400 }
      )
    }

    // 2. Authorization check: id-cards bucket is open for new applicant registration;
    // all other buckets require an authenticated staff member or super admin.
    if (requestedBucket !== 'id-cards') {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized. Login required to upload assets.' }, { status: 401 })
      }

      const meta = user.user_metadata || {}
      const isAuthorized =
        user.email === 'reshiftapp@gmail.com' ||
        meta.role === 'super_admin' ||
        (meta.is_staff === true && meta.approval_status === 'approved')

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Forbidden. Staff credentials required.' }, { status: 403 })
      }
    }

    // 3. File size check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds maximum allowed size of 10 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB provided)` },
        { status: 400 }
      )
    }

    // 4. MIME type check
    const mimeType = file.type?.toLowerCase() || ''
    const safeExt = MIME_EXTENSION_MAP[mimeType]
    if (!safeExt) {
      return NextResponse.json(
        {
          error: `Unsupported file type: '${file.type}'. Allowed types: JPG, PNG, WEBP, PDF.`,
        },
        { status: 400 }
      )
    }

    // 5. Generate secure, collision-free filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${safeExt}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // 6. Upload to Supabase Storage using admin client
    const { error: uploadError } = await supabaseAdmin.storage
      .from(requestedBucket)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // 7. Retrieve public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(requestedBucket)
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName,
    })
  } catch (err: any) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
