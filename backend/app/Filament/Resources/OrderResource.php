<?php

namespace App\Filament\Resources;

use App\Enums\PaymentMethod;
use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use App\Support\Money;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Enums\FontWeight;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static \BackedEnum|string|null $navigationIcon = Heroicon::OutlinedReceiptPercent;

    protected static ?string $navigationLabel = 'Transaksi';

    protected static ?int $navigationSort = 3;

    public static function canCreate(): bool
    {
        return false; // Transaksi hanya dibuat lewat API kasir
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([]); // tidak dipakai: transaksi read-only
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Informasi Transaksi')
                ->schema([
                    TextEntry::make('order_no')->label('No. Order')->badge(),
                    TextEntry::make('user.name')->label('Kasir'),
                    TextEntry::make('created_at')->label('Waktu')->dateTime('d M Y, H:i'),
                    TextEntry::make('payment_method')
                        ->label('Metode')
                        ->badge()
                        ->formatStateUsing(fn (PaymentMethod $state): string => $state->label()),
                ])
                ->columns(2),
            Section::make('Item')
                ->schema([
                    RepeatableEntry::make('items')
                        ->label('')
                        ->schema([
                            TextEntry::make('product_name')->label('Produk'),
                            TextEntry::make('qty')->label('Qty'),
                            TextEntry::make('price')->label('Harga')->formatStateUsing(fn (mixed $state): string => Money::format($state)),
                            TextEntry::make('subtotal')->label('Subtotal')->formatStateUsing(fn (mixed $state): string => Money::format($state)),
                        ])
                        ->columns(4)
                        ->columnSpanFull(),
                ]),
            Section::make('Pembayaran')
                ->schema([
                    TextEntry::make('subtotal')->label('Subtotal')->formatStateUsing(fn (mixed $state): string => Money::format($state)),
                    TextEntry::make('discount')->label('Diskon')->formatStateUsing(fn (mixed $state): string => '- '.Money::format($state)),
                    TextEntry::make('tax')->label('PPN 11%')->formatStateUsing(fn (mixed $state): string => Money::format($state)),
                    TextEntry::make('total')->label('Total')->formatStateUsing(fn (mixed $state): string => Money::format($state))->weight(FontWeight::Bold),
                    TextEntry::make('cash_received')->label('Bayar (Tunai)')->formatStateUsing(fn (mixed $state): string => $state === null ? '-' : Money::format($state)),
                    TextEntry::make('change_amount')->label('Kembalian')->formatStateUsing(fn (mixed $state): string => $state === null ? '-' : Money::format($state)),
                ])
                ->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order_no')
                    ->label('No. Order')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('user.name')
                    ->label('Kasir'),
                TextColumn::make('created_at')
                    ->label('Waktu')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
                TextColumn::make('payment_method')
                    ->label('Metode')
                    ->badge()
                    ->color(fn (PaymentMethod $state): string => match ($state) {
                        PaymentMethod::Tunai => 'success',
                        PaymentMethod::Qris => 'info',
                        PaymentMethod::Kartu => 'warning',
                    })
                    ->formatStateUsing(fn (PaymentMethod $state): string => $state->label()),
                TextColumn::make('items_count')
                    ->counts('items')
                    ->label('Item'),
                TextColumn::make('total')
                    ->label('Total')
                    ->sortable()
                    ->formatStateUsing(fn (mixed $state): string => Money::format($state)),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                ViewAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'view' => Pages\ViewOrder::route('/{record}'),
        ];
    }
}
