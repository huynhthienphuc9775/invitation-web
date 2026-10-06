import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getCategories } from '@/api/categories'
import {
  getInvitationStatsByEvent,
  INVITATION_STATS_EVENT,
} from '@/api/invitations'
import { getErrorMessage } from '@/lib/get-error-message'
import { createSocket } from '@/lib/socket'
import type { InvitationStatsMessage } from '@/types/invitation'

const ALL_CATEGORIES = 'all'
const STATS_QUERY_KEY = ['invitations', 'stats-by-event']
const BAR_ROW_HEIGHT = 40
const MAX_LABEL_LENGTH = 20

// Cặp xanh/cam đã kiểm tra đủ tương phản trên nền card và phân biệt được khi mù màu;
// --chart-* của theme toàn màu xám nên không dùng được.
const chartConfig = {
  active: {
    label: 'Hoạt động',
    theme: { light: '#2a78d6', dark: '#3987e5' },
  },
  inactive: {
    label: 'Tạm ẩn',
    theme: { light: '#eb6834', dark: '#d95926' },
  },
} satisfies ChartConfig

function truncate(text: string) {
  return text.length > MAX_LABEL_LENGTH
    ? `${text.slice(0, MAX_LABEL_LENGTH - 1)}…`
    : text
}

export function DashboardPage() {
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const categories = categoriesQuery.data ?? []

  function getCategoryName(id: number) {
    return categories.find((category) => category.id === id)?.name ?? `#${id}`
  }

  const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES)

  // Luôn lấy toàn bộ rồi lọc category ở client, vì socket cũng chỉ đẩy về dữ liệu
  // chưa lọc — nhờ vậy ghi đè cache bằng message socket là đủ, không phải fetch lại.
  const statsQuery = useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: () => getInvitationStatsByEvent(),
  })

  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const socket = createSocket()

    socket.on('connect', () => setIsLive(true))
    socket.on('disconnect', () => setIsLive(false))
    socket.on('connect_error', () => setIsLive(false))
    socket.on(INVITATION_STATS_EVENT, (message: InvitationStatsMessage) => {
      queryClient.setQueryData(STATS_QUERY_KEY, message.stats)
    })
    // Trong lúc mất kết nối có thể đã lỡ message, nên lấy lại số liệu một lần.
    socket.io.on('reconnect', () => {
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY })
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient])

  const rows = (statsQuery.data?.data ?? []).filter(
    (row) =>
      filterCategory === ALL_CATEGORIES ||
      row.categoryId === Number(filterCategory),
  )
  const total = rows.reduce((sum, row) => sum + row.total, 0)
  const totalActive = rows.reduce((sum, row) => sum + row.active, 0)
  const totalInactive = rows.reduce((sum, row) => sum + row.inactive, 0)

  const summaries = [
    { label: 'Tổng thiệp mời', value: total },
    { label: 'Hoạt động', value: totalActive },
    { label: 'Tạm ẩn', value: totalInactive },
    { label: 'Sự kiện', value: rows.length },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <Select
          value={filterCategory}
          onValueChange={(value) => setFilterCategory(value as string)}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) =>
                value === ALL_CATEGORIES
                  ? 'Tất cả danh mục'
                  : getCategoryName(Number(value))
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaries.map((summary) => (
          <Card key={summary.label} size="sm">
            <CardHeader>
              <CardTitle className="text-muted-foreground">
                {summary.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">
                  {summary.value.toLocaleString('vi-VN')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Thiệp mời theo sự kiện</CardTitle>
          <CardAction>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={`size-2 rounded-full ${isLive ? 'bg-success' : 'bg-muted-foreground/40'}`}
              />
              {isLive ? 'Cập nhật trực tiếp' : 'Chưa kết nối trực tiếp'}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent>
          {statsQuery.isLoading && <Skeleton className="h-64 w-full" />}
          {statsQuery.isError && (
            <p className="py-8 text-center text-sm text-destructive">
              {getErrorMessage(statsQuery.error)}
            </p>
          )}
          {statsQuery.isSuccess && rows.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có sự kiện nào.
            </p>
          )}
          {statsQuery.isSuccess && rows.length > 0 && (
            <ChartContainer
              config={chartConfig}
              className="w-full"
              // Cột ngang, chiều cao tăng theo số sự kiện để tên không bị chồng lên nhau.
              style={{
                aspectRatio: 'auto',
                height: rows.length * BAR_ROW_HEIGHT + 64,
              }}
            >
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ left: 0, right: 16 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="eventName"
                  width={150}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={truncate}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="active"
                  stackId="invitations"
                  fill="var(--color-active)"
                  stroke="var(--card)"
                  strokeWidth={2}
                  barSize={24}
                />
                <Bar
                  dataKey="inactive"
                  stackId="invitations"
                  fill="var(--color-inactive)"
                  stroke="var(--card)"
                  strokeWidth={2}
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
