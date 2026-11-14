import React from 'react'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PropertyForm } from '@/components/housing/property-form'
import { Database } from '@/types/database.types'

type PropertyRow = Database['public']['Tables']['properties']['Row']

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params

  const { data: rawProperty } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (!rawProperty) {
    notFound()
  }

  const property = rawProperty as PropertyRow

  return <PropertyForm initialData={property} />
}
