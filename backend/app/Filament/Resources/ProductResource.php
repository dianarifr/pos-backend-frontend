<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use App\Support\Money;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static \BackedEnum|string|null $navigationIcon = Heroicon::OutlinedCube;

    protected static ?string $navigationLabel = 'Produk';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')
                ->label('Nama Produk')
                ->required()
                ->maxLength(255)
                ->columnSpanFull(),
            Select::make('category_id')
                ->label('Kategori')
                ->relationship('category', 'name')
                ->required(),
            TextInput::make('sku')
                ->label('SKU')
                ->required()
                ->maxLength(50)
                ->unique(ignoreRecord: true),
            TextInput::make('price')
                ->label('Harga (Rp)')
                ->numeric()
                ->integer()
                ->required()
                ->minValue(0)
                ->prefix('Rp'),
            TextInput::make('stock')
                ->label('Stok')
                ->numeric()
                ->integer()
                ->required()
                ->minValue(0),
            TextInput::make('emoji')
                ->label('Emoji')
                ->maxLength(8)
                ->default('🍽️'),
            Select::make('color')
                ->label('Warna Kartu')
                ->options([
                    'bg-orange-100' => 'Oranye',
                    'bg-amber-100' => 'Kuning',
                    'bg-sky-100' => 'Biru Muda',
                    'bg-blue-100' => 'Biru',
                    'bg-rose-100' => 'Merah Muda',
                    'bg-red-100' => 'Merah',
                    'bg-lime-100' => 'Hijau',
                    'bg-yellow-100' => 'Kuning Cerah',
                    'bg-violet-100' => 'Ungu',
                    'bg-gray-100' => 'Abu-abu',
                ])
                ->default('bg-orange-100'),
            Toggle::make('is_active')
                ->label('Aktif di Kasir')
                ->default(true)
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('emoji')->label(''),
                TextColumn::make('name')
                    ->label('Produk')
                    ->searchable()
                    ->sortable()
                    ->description(fn (Product $record): string => $record->sku),
                TextColumn::make('category.name')
                    ->label('Kategori')
                    ->badge(),
                TextColumn::make('price')
                    ->label('Harga')
                    ->sortable()
                    ->formatStateUsing(fn (mixed $state): string => Money::format($state)),
                TextColumn::make('stock')
                    ->label('Stok')
                    ->sortable()
                    ->badge()
                    ->color(fn (Product $record): string => $record->stock <= 0 ? 'danger' : ($record->stock <= 5 ? 'warning' : 'success')),
                ToggleColumn::make('is_active')
                    ->label('Aktif'),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->relationship('category', 'name')
                    ->label('Kategori'),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
