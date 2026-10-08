import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCustomers } from '@/api/customers'
import { getErrorMessage } from '@/lib/get-error-message'

const PAGE_SIZE = 10
const ALL_STATUSES = 'all'
const VERIFIED = 'verified'
const UNVERIFIED = 'unverified'

const STATUS_LABELS: Record<string, string> = {
  [ALL_STATUSES]: 'Tất cả trạng thái',
  [VERIFIED]: 'Đã xác thực',
  [UNVERIFIED]: 'Chưa xác thực',
}

export function CustomersPage() {
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>(ALL_STATUSES)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const customersQuery = useQuery({
    queryKey: ['customers', { page, filterStatus, search }],
    queryFn: () =>
      getCustomers({
        page,
        limit: PAGE_SIZE,
        emailVerified:
          filterStatus === ALL_STATUSES ? undefined : filterStatus === VERIFIED,
        search: search || undefined,
      }),
  })

  function handleFilterStatusChange(value: string) {
    setFilterStatus(value)
    setPage(1)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Khách hàng</h1>

      <div className="mt-4 flex gap-3">
        <Select
          value={filterStatus}
          onValueChange={(value) => handleFilterStatusChange(value as string)}
        >
          <SelectTrigger className="w-48">
            <SelectValue>{(value: string) => STATUS_LABELS[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[ALL_STATUSES, VERIFIED, UNVERIFIED].map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo email"
          className="w-64"
        />
      </div>

      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đăng ký</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}
            {customersQuery.isError && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-destructive">
                  {getErrorMessage(customersQuery.error)}
                </TableCell>
              </TableRow>
            )}
            {customersQuery.isSuccess && customersQuery.data.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Chưa có khách hàng nào.
                </TableCell>
              </TableRow>
            )}
            {customersQuery.data?.data.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <Badge variant={customer.emailVerified ? 'default' : 'secondary'}>
                    {customer.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(customer.createdAt).toLocaleString('vi-VN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {customersQuery.isSuccess && customersQuery.data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {customersQuery.data.page}/{customersQuery.data.totalPages} —
            Tổng {customersQuery.data.total} khách hàng
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= customersQuery.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
