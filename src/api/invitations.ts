import { apiClient } from '@/lib/api-client'
import type {
  CreateInvitationPayload,
  GetInvitationStatsParams,
  GetInvitationsParams,
  Invitation,
  InvitationStatsByEvent,
  PaginatedInvitations,
  UpdateInvitationPayload,
} from '@/types/invitation'

export async function getInvitations(params: GetInvitationsParams = {}) {
  const { data } = await apiClient.get<PaginatedInvitations>('/invitations', {
    params,
  })
  return data
}

// Tên event Socket.IO, server bắn mỗi khi số liệu biểu đồ thay đổi.
export const INVITATION_STATS_EVENT = 'invitation:stats-by-event'

export async function getInvitationStatsByEvent(
  params: GetInvitationStatsParams = {},
) {
  const { data } = await apiClient.get<InvitationStatsByEvent>(
    '/invitations/stats/by-event',
    { params },
  )
  return data
}

export async function createInvitation(payload: CreateInvitationPayload) {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('eventId', String(payload.eventId))
  formData.append('image', payload.image)
  if (payload.active !== undefined) {
    formData.append('active', String(payload.active))
  }

  const { data } = await apiClient.post<Invitation>('/invitations', formData)
  return data
}

export async function updateInvitation({
  id,
  name,
  eventId,
  image,
  active,
}: UpdateInvitationPayload) {
  const formData = new FormData()
  if (name) formData.append('name', name)
  if (eventId !== undefined) formData.append('eventId', String(eventId))
  if (image) formData.append('image', image)
  if (active !== undefined) formData.append('active', String(active))

  const { data } = await apiClient.patch<Invitation>(
    `/invitations/${id}`,
    formData,
  )
  return data
}

export async function deleteInvitation(id: number) {
  await apiClient.delete(`/invitations/${id}`)
}
