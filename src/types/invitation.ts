import type { Event } from '@/types/event'

export interface Invitation {
  id: number
  name: string
  eventId: number
  event: Event
  imageUrl: string
  active: boolean
  createdAt: string
}

export interface PaginatedInvitations {
  data: Invitation[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetInvitationsParams {
  eventId?: number
  // Lọc theo danh mục của sự kiện; invitation không tự lưu categoryId.
  categoryId?: number
  active?: boolean
  page?: number
  limit?: number
}

export interface CreateInvitationPayload {
  name: string
  eventId: number
  image: File
  active?: boolean
}

export interface UpdateInvitationPayload {
  id: number
  name?: string
  eventId?: number
  image?: File
  active?: boolean
}

export interface InvitationCountByEvent {
  eventId: number
  eventName: string
  categoryId: number
  total: number
  active: number
  inactive: number
}

export interface InvitationStatsByEvent {
  data: InvitationCountByEvent[]
  total: number
}

export interface GetInvitationStatsParams {
  categoryId?: number
}

// `stats` server đẩy qua socket luôn là toàn bộ, không lọc theo category.
export interface InvitationStatsMessage {
  source: 'invitation' | 'event'
  action: 'created' | 'updated' | 'deleted'
  id: number
  stats: InvitationStatsByEvent
}
