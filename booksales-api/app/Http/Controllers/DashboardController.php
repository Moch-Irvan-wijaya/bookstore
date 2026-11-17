<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use App\Models\Transaction;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    // Admin: ringkasan untuk halaman dashboard
    public function index()
    {
        // pendapatan hanya dihitung dari pesanan yang sudah dibayar atau dikirim
        $revenue = Transaction::whereIn('status', ['paid', 'shipped'])->sum('total_amount');

        $statusCounts = Transaction::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        // nilai pesanan masuk per hari (pesanan yang dibatalkan tidak dihitung)
        $salesByDay = Transaction::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', Carbon::today()->subDays(6))
            ->select(DB::raw('DATE(created_at) as day'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('day')
            ->pluck('total', 'day');

        $last7Days = collect(range(6, 0))->map(function ($daysAgo) use ($salesByDay) {
            $date = Carbon::today()->subDays($daysAgo);

            return [
                'date' => $date->toDateString(),
                'label' => $date->format('d/m'),
                'total' => (float) ($salesByDay[$date->toDateString()] ?? 0),
            ];
        })->values();

        $recentOrders = Transaction::with(['customer:id,name', 'book:id,title'])
            ->latest()
            ->limit(5)
            ->get(['id', 'order_number', 'customer_id', 'book_id', 'quantity', 'total_amount', 'status', 'created_at']);

        $lowStock = Book::where('stock', '<=', 5)
            ->orderBy('stock')
            ->limit(5)
            ->get(['id', 'title', 'stock']);

        $topBooks = Transaction::where('status', '!=', 'cancelled')
            ->select('book_id', DB::raw('SUM(quantity) as sold'))
            ->groupBy('book_id')
            ->orderByDesc('sold')
            ->limit(5)
            ->with('book:id,title')
            ->get()
            ->map(fn ($row) => [
                'title' => $row->book?->title,
                'sold' => (int) $row->sold,
            ]);

        return $this->ok('Ringkasan dashboard', [
            'totals' => [
                'books' => Book::count(),
                'genres' => Genre::count(),
                'authors' => Author::count(),
                'customers' => User::where('role', 'customer')->count(),
                'admins' => User::where('role', 'admin')->count(),
                'orders' => Transaction::count(),
                'revenue' => (float) $revenue,
            ],
            'status' => [
                'pending' => (int) $statusCounts->get('pending', 0),
                'paid' => (int) $statusCounts->get('paid', 0),
                'shipped' => (int) $statusCounts->get('shipped', 0),
                'cancelled' => (int) $statusCounts->get('cancelled', 0),
            ],
            'sales_last_7_days' => $last7Days,
            'recent_orders' => $recentOrders,
            'low_stock' => $lowStock,
            'top_books' => $topBooks,
        ]);
    }
}