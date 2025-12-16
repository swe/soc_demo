# Overview Design Code - Apple HIG Principles

## Обзор

Данный документ описывает принципы дизайн-кода, отступов, типографики и стилизации для всех страниц в разделе `/overview`. Дизайн основан на **Apple Human Interface Guidelines (HIG)** с адаптацией под Security Operations Centre и цветовую схему Svalbard.

---

## 1. Система отступов (Spacing System)

### 8px Grid System

Все отступы должны быть кратны 8px для обеспечения визуальной согласованности:

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

### Применение в коде

- **Внутренние отступы карточек**: `padding: var(--spacing-lg)` (24px)
- **Отступы между элементами**: `gap-4` (16px) или `gap-6` (24px)
- **Отступы секций**: `mb-6` (24px) или `mb-8` (32px)
- **Отступы контента страницы**: `px-4 sm:px-6 lg:px-8 py-8` (responsive)

### Правила

- ✅ Используйте CSS переменные `var(--spacing-*)` в CSS файлах
- ✅ Используйте Tailwind классы (`gap-4`, `mb-6`, `p-6`) в JSX для layout
- ✅ Минимальный отступ между элементами: 8px
- ❌ Избегайте произвольных значений (например, `margin: 13px`)

---

## 2. Типографика (Typography)

### Шрифт

**SF Pro** (Apple системный шрифт):
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

### Иерархия текста

| Класс | Размер | Назначение | Пример использования |
|-------|--------|------------|----------------------|
| `.hig-title-large` | 2.5rem (40px) | Заголовки страниц | `<h1 className="hig-title-large">` |
| `.hig-title` | 1.75rem (28px) | Заголовки секций | `<h2 className="hig-title">` |
| `.hig-headline` | 1.375rem (22px) | Заголовки карточек | `<h2 className="hig-headline">` |
| `.hig-body` | 1rem (16px) | Основной текст | `<p className="hig-body">` |
| `.hig-caption` | 0.8125rem (13px) | Вторичный текст, метки | `<span className="hig-caption">` |

### Применение

```tsx
// ✅ Правильно
<h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">
  Security Operations Center
</h1>
<p className="hig-body text-gray-600 dark:text-gray-400">
  Monitor and manage security incidents
</p>

// ❌ Неправильно
<h1 className="text-3xl font-bold">Title</h1>
```

### Правила

- ✅ Всегда используйте HIG классы для типографики
- ✅ Используйте `letter-spacing: -0.01em` для улучшения читаемости
- ✅ Применяйте `-webkit-font-smoothing: antialiased` для сглаживания
- ❌ Не используйте произвольные размеры шрифтов

---

## 3. Цветовая палитра (Color Palette)

### Брендовые цвета Svalbard

```css
/* Primary */
--svalbard-primary-purple: #A655F7;
--svalbard-black-pearl: #0F172A;

/* Supplementary */
--svalbard-pale-lilac: #E3CAFE;
--svalbard-cobalt: #393A84;
--svalbard-burning-orange: #F97316;
--svalbard-charcoal: #333332;
```

### Системные цвета для статусов и алертов

```css
/* Универсальные цвета для алертов */
--color-system-blue: #007AFF;      /* Информация, низкий приоритет */
--color-system-green: #34C759;    /* Успех, resolved, online */
--color-system-orange: #FF9500;  /* Предупреждение, investigating */
--color-system-red: #FF3B30;      /* Критично, ошибка, critical */
--color-system-yellow: #FFCC00;   /* Внимание, medium severity */
--color-system-purple: #AF52DE;   /* Hover эффекты для ссылок */
--color-system-gray: #8E8E93;     /* Нейтральный, offline */
```

### Фоновые цвета

**Light Mode:**
```css
--bg-primary: #FFFFFF;
--bg-secondary: #F2F2F7;
--bg-tertiary: #FFFFFF;
--bg-elevated: #FFFFFF;
```

**Dark Mode:**
```css
--bg-primary-dark: #0F172A;
--bg-secondary-dark: #1E293B;
--bg-tertiary-dark: #1E293B;  /* Темно-синий, не коричневый */
--bg-elevated-dark: #334155;
```

### Текстовые цвета

**Light Mode:**
```css
--text-primary: #000000;
--text-secondary: #3C3C43;
--text-tertiary: #8E8E93;
```

**Dark Mode:**
```css
--text-primary-dark: #FFFFFF;
--text-secondary-dark: #EBEBF5;
--text-tertiary-dark: #8E8E93;
```

### Применение

```tsx
// ✅ Правильно - используйте Tailwind классы с темной темой
<div className="text-gray-900 dark:text-gray-100">
<div className="text-gray-600 dark:text-gray-400">
<div className="bg-white dark:bg-[#1E293B]">

// ✅ Для ссылок при hover
<a className="hig-caption hig-link-hover">View →</a>
// При hover становится фиолетовым: #AF52DE
```

### Правила

- ✅ Всегда поддерживайте светлую и темную темы
- ✅ Используйте системные цвета для статусов (красный для критических, зеленый для resolved)
- ✅ Карточки в темной теме: `#1E293B` (темно-синий), не коричневый
- ✅ Для hover ссылок используйте `#AF52DE` (системный фиолетовый)
- ❌ Не используйте хардкод цветов в JSX, используйте CSS переменные или Tailwind

---

## 4. Радиусы скругления (Border Radius)

### Система радиусов

```css
--radius-sm: 0.5rem;     /* 8px */
--radius-md: 0.625rem;   /* 10px */
--radius-lg: 1rem;       /* 16px */
--radius-xl: 1.25rem;    /* 20px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-3xl: 2rem;      /* 32px */
```

### Применение

| Элемент | Радиус | Класс |
|---------|--------|-------|
| Карточки | `--radius-xl` (20px) | `.hig-card` |
| Кнопки | `--radius-md` (10px) | `.hig-button` |
| Инпуты | `--radius-md` (10px) | `.hig-input` |
| Модальные окна | `--radius-3xl` (32px) | `.hig-modal` |
| Бейджи | `--radius-lg` (16px) | `.hig-badge` |

### Правила

- ✅ Используйте CSS переменные в CSS файлах
- ✅ Используйте Tailwind классы (`rounded-lg`, `rounded-xl`) в JSX
- ❌ Избегайте произвольных значений

---

## 5. Тени (Shadows)

### Система теней

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Применение

- **Карточки**: `box-shadow: var(--shadow-sm)`
- **Модальные окна**: `box-shadow: var(--shadow-2xl)`
- **Кнопки primary**: `box-shadow: 0 2px 8px rgba(57, 58, 132, 0.3)`

### Правила

- ✅ Используйте многослойные тени для глубины
- ❌ Избегайте резких теней, используйте мягкие переходы
- ❌ Не используйте тени при hover (минималистичный стиль)

---

## 6. Компоненты и классы

### Карточки (Cards)

```tsx
// ✅ Стандартная карточка
<div className="hig-card">
  <h2 className="hig-headline">Title</h2>
  {/* Content */}
</div>

// ✅ Метрическая карточка (с иконками - опционально)
<div className="hig-metric-card">
  <div className="hig-caption">Label</div>
  <div className="hig-metric-value">123</div>
</div>

// ✅ Метрическая карточка (без иконок, только значения)
<div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Label</div>
  <div className="hig-metric-value text-4xl text-gray-900 dark:text-gray-100">
    123
  </div>
</div>

// ✅ Метрическая карточка с цветным значением (только для статусов)
<div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Compliance</div>
  <div 
    className="text-4xl font-bold"
    style={{ 
      color: statusColor,
      WebkitTextFillColor: statusColor
    }}
  >
    ✓
  </div>
</div>

// ✅ Метрическая карточка с условным цветом (на основе значения)
<div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4 text-center">
  <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Risk Score</div>
  <div 
    className="hig-metric-value text-4xl"
    style={{ 
      color: value >= 70 ? '#FF3B30' : value >= 40 ? '#FF9500' : '#34C759',
      WebkitTextFillColor: value >= 70 ? '#FF3B30' : value >= 40 ? '#FF9500' : '#34C759'
    }}
  >
    {value}
  </div>
</div>
```

**Стили:**
- Фон: `var(--bg-primary)` (light) / `var(--bg-tertiary-dark)` (dark)
- Радиус: `--radius-xl` (20px)
- Отступы: `var(--spacing-lg)` (24px)
- Тень: `var(--shadow-sm)`
- Граница: `0.5px solid var(--separator-opaque)`

### Кнопки (Buttons)

```tsx
// ✅ Primary кнопка
<button className="hig-button hig-button-primary">
  Save Changes
</button>

// ✅ Secondary кнопка
<button className="hig-button hig-button-secondary">
  Cancel
</button>
```

**Стили:**
- Primary: фон `--svalbard-cobalt` (#393A84), hover `--svalbard-primary-purple` (#A655F7)
- Secondary: фон `--bg-tertiary`, граница `--separator`
- Радиус: `--radius-md` (10px)
- Отступы: `0.625rem 1.25rem` (10px 20px)
- **Hover эффекты**: только изменение цвета, без transform/scale

### Инпуты (Inputs)

```tsx
// ✅ Текстовое поле
<input className="hig-input w-full" />

// ✅ Textarea
<textarea className="hig-input w-full min-h-[100px] resize-none" />
```

**Стили:**
- Фон: `var(--bg-primary)` (light) / `var(--bg-tertiary-dark)` (dark)
- Радиус: `--radius-md` (10px)
- Отступы: `0.75rem 1rem` (12px 16px)
- Focus: граница `--svalbard-cobalt`, тень `0 0 0 3px rgba(57, 58, 132, 0.1)`
- Textarea: `resize-none` (нельзя изменять размер)

### Бейджи (Badges)

```tsx
// ✅ Статус бейдж
<span 
  className="hig-badge" 
  style={{ 
    backgroundColor: `${statusColor}20`,
    color: statusColor
  }}
>
  {status}
</span>
```

**Стили:**
- Радиус: `--radius-lg` (16px)
- Отступы: `0.25rem 0.625rem` (4px 10px)
- Фон: цветной с прозрачностью 20% (например, `rgba(255, 59, 48, 0.2)`)

### Модальные окна (Modals)

```tsx
<div className="hig-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]">
    {/* Fixed Header */}
    <div 
      className="sticky top-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-b border-gray-200 dark:border-gray-700/60 p-6 pb-4"
      style={{
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        backdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      {/* Header content */}
    </div>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto px-6 py-6">
      {/* Content */}
    </div>

    {/* Fixed Footer */}
    <div 
      className="sticky bottom-0 z-10 backdrop-blur-xl backdrop-saturate-150 bg-white/80 dark:bg-[#1E293B]/80 border-t border-gray-200 dark:border-gray-700/60 p-6 pt-4"
      style={{
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        backdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      {/* Footer content */}
    </div>
  </div>
</div>
```

**Стили:**
- Backdrop: `rgba(0, 0, 0, 0.4)` с `backdrop-filter: blur(20px)`
- Модальное окно: радиус `--radius-3xl` (32px), тень `--shadow-2xl`
- Max-height: `90vh` с flexbox структурой
- Header/Footer: фиксированные с размытием (`backdrop-blur-xl`)
- Контент: прокручивается между header и footer

---

## 7. Layout и структура страниц

### Базовая структура

```tsx
<div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
  {/* Заголовок страницы */}
  <div className="mb-6 hig-fade-in">
    <h1 className="hig-title-large text-gray-900 dark:text-gray-100 mb-2">
      Page Title
    </h1>
    <p className="hig-body text-gray-600 dark:text-gray-400">
      Description
    </p>
  </div>

  {/* Статистика (опционально) */}
  <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60">
    <div className="flex items-center gap-8 flex-wrap">
      <span className="hig-caption text-gray-600 dark:text-gray-400 font-medium">Label:</span>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[#34C759] rounded-full"></div>
        <span className="hig-body font-semibold text-[#34C759]">Value</span>
        <span className="hig-caption text-gray-600 dark:text-gray-400">Label</span>
      </div>
      {/* More stats */}
    </div>
  </div>

  {/* Контент */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Cards */}
  </div>
</div>
```

### Grid система

```tsx
// ✅ Метрические карточки в ряд
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Metric cards */}
</div>

// ✅ Три карточки в ряд
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// ✅ Две колонки
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Content */}
</div>

// ✅ Карточки устройств/элементов
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {/* Item cards */}
</div>

// ✅ Split-screen layout: таблица + боковая панель
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  {/* Основной контент - таблица/список */}
  <div className="lg:col-span-8">
    {/* Table content */}
  </div>
  
  {/* Боковая панель - аналитика */}
  <div className="lg:col-span-4 space-y-6">
    {/* Analytics cards */}
  </div>
</div>
```

### Правила

- ✅ Используйте `max-w-7xl mx-auto` для центрирования контента
- ✅ Responsive padding: `px-4 sm:px-6 lg:px-8`
- ✅ Отступы между секциями: `mb-6` или `mb-8`
- ✅ Gap между элементами: `gap-4` (16px) или `gap-6` (24px)
- ✅ Split-screen: основная часть 8/12 колонок, боковая панель 4/12 колонок

---

## 8. Табличное отображение с expandable details

### Структура таблицы

```tsx
// ✅ Табличное отображение элементов с раскрывающимися деталями
<div className="hig-card">
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60">
    <h2 className="hig-headline text-gray-900 dark:text-gray-100">Items</h2>
    <span className="hig-caption text-gray-600 dark:text-gray-400">{total} total</span>
  </div>

  <div className="space-y-0">
    {items.map((item, idx) => {
      const isExpanded = selectedItem?.id === item.id
      
      return (
        <div key={item.id}>
          <div 
            className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
              idx !== items.length - 1 ? 'border-b border-gray-200 dark:border-gray-700/60' : ''
            } ${isExpanded ? 'bg-gray-50 dark:bg-[#334155]/30' : 'hover:bg-gray-50 dark:hover:bg-[#334155]/20'}`}
            onClick={() => setSelectedItem(isExpanded ? null : item)}
          >
            {/* Индикатор severity/status */}
            <div 
              className="w-1 h-12 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: severityColor,
                boxShadow: `0 0 8px ${severityColor}40`
              }}
            />
            
            {/* Колонки данных */}
            <div className="w-32 flex-shrink-0">
              <span className="hig-caption font-mono text-gray-600 dark:text-gray-400">
                {item.id}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2" title={item.title}>
                {item.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Badges */}
              </div>
            </div>
            
            {/* Метрики справа */}
            <div className="flex items-center gap-6 flex-shrink-0">
              {/* Metrics */}
            </div>
          </div>

          {/* Expanded Details - показывать другую информацию */}
          {isExpanded && (
            <div className="px-4 pb-4 bg-gray-50 dark:bg-[#334155]/30 border-b border-gray-200 dark:border-gray-700/60">
              <div className="pt-4 space-y-4">
                {/* Description */}
                {item.description && (
                  <div>
                    <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2 font-semibold">Description</div>
                    <div className="hig-body text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Additional technical info */}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button className="hig-button hig-button-primary flex-1">Action</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    })}
  </div>
</div>
```

### Правила

- ✅ Используйте `line-clamp-2` для многострочного текста в заголовках
- ✅ Добавьте `title` атрибут для tooltip с полным текстом
- ✅ В expanded view показывайте **другую информацию**, не дублируйте базовые данные
- ✅ Используйте `min-w-0` на flex-контейнерах для правильного truncate
- ✅ Индикатор severity - цветная полоска слева с тенью
- ✅ Hover эффект: только изменение фона, без transform

---

## 9. Объединенные блоки метрик и статусов

### Паттерн объединения

```tsx
// ✅ Объединенный блок Overview & Status
<div className="hig-card">
  <h2 className="hig-headline text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/60">
    Overview & Status
  </h2>
  
  {/* Метрики в сетке */}
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div className="bg-gray-50 dark:bg-[#334155]/30 rounded-lg p-4 text-center">
      <div className="hig-caption text-gray-600 dark:text-gray-400 mb-2">Label</div>
      <div className="hig-metric-value text-3xl text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
    {/* More metrics */}
  </div>

  {/* Статусы с разделителем */}
  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700/60">
    {statuses.map((status) => (
      <div key={status.id}>
        <div className="flex items-center justify-between mb-2">
          <span className="hig-body text-gray-700 dark:text-gray-300">{status.name}</span>
          <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{status.count}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full" 
            style={{ 
              width: `${(status.count / total) * 100}%`,
              backgroundColor: status.color
            }}
          ></div>
        </div>
      </div>
    ))}
  </div>
</div>
```

### Правила

- ✅ Объединяйте связанные метрики и статусы в один блок
- ✅ Используйте разделитель `border-t` между секциями
- ✅ Метрики в компактной сетке 2x2
- ✅ Статусы с прогресс-барами ниже

---

## 10. Пагинация

### Реализация пагинации

```tsx
// ✅ Пагинация с кнопками и номерами страниц
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 10
const totalPages = Math.ceil(items.length / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const currentItems = items.slice(startIndex, startIndex + itemsPerPage)

{totalPages > 1 && (
  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/60">
    <div className="flex items-center justify-between">
      <div className="hig-caption text-gray-600 dark:text-gray-400">
        Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{startIndex + 1}</span> to{' '}
        <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(startIndex + itemsPerPage, items.length)}</span> of{' '}
        <span className="font-semibold text-gray-900 dark:text-gray-100">{items.length}</span> results
      </div>
      <nav className="flex items-center gap-2" role="navigation">
        <button
          className={`hig-button hig-button-secondary ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            return (
              <button
                key={pageNum}
                className={`hig-button ${currentPage === pageNum ? 'hig-button-primary' : 'hig-button-secondary'}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        <button
          className={`hig-button hig-button-secondary ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  </div>
)}
```

### Правила

- ✅ Показывайте до 5 номеров страниц одновременно
- ✅ Используйте HIG кнопки для навигации
- ✅ Отображайте счетчик "Showing X to Y of Z results"
- ✅ При смене страницы закрывайте expanded details
- ✅ Отступы: `mt-6 pt-4` с разделителем сверху

---

## 11. Многострочный текст

### Line clamp для ограничения строк

```tsx
// ✅ Многострочный текст с ограничением
<h3 className="hig-body font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2" title={fullText}>
  {fullText}
</h3>
```

**CSS класс:**
```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Правила

- ✅ Используйте `line-clamp-2` для заголовков, которые могут быть длинными
- ✅ Добавляйте `title` атрибут для показа полного текста при hover
- ✅ Используйте `min-w-0` на flex-контейнерах для правильной работы truncate

---

## 12. Анимации и переходы

### Принципы

- ✅ Минималистичный подход: **без hover эффектов**, которые изменяют размер или тень
- ✅ Плавные переходы: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- ✅ Fade-in анимация: `.hig-fade-in` для появления элементов

### Запрещенные эффекты

```css
/* ❌ НЕ используйте */
.hig-card:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
}

/* ✅ Используйте только изменение цвета */
.hig-button-primary:hover {
  background-color: var(--svalbard-primary-purple);
}
```

### Разрешенные эффекты

- Изменение цвета при hover (кнопки, ссылки)
- Fade-in анимация при загрузке
- Плавные переходы цветов

---

## 13. Ссылки (Links)

### Стилизация

```tsx
// ✅ Ссылка с hover эффектом
<Link href="/overview/incidents" className="hig-caption hig-link-hover">
  View All →
</Link>
```

**Hover эффект:**
- Цвет меняется на `#AF52DE` (системный фиолетовый)
- Плавный переход: `transition-colors`

### Правила

- ✅ Все ссылки "View →", "View Details →" должны иметь hover эффект
- ✅ Используйте класс `hig-link-hover` или `hover:text-[#AF52DE]`

---

## 14. Статусы и индикаторы

### Цветовая кодировка статусов

```tsx
// ✅ Статус как бейдж
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    resolved: '#34C759',      // Зеленый
    investigating: '#FF9500', // Оранжевый
    escalated: '#FF3B30',     // Красный
    online: '#34C759',        // Зеленый
    offline: '#8E8E93',       // Серый
    warning: '#FF9500',        // Оранжевый
  }
  return colors[status] || '#8E8E93'
}

<span 
  className="hig-badge" 
  style={{ 
    backgroundColor: `${getStatusColor(status)}20`,
    color: getStatusColor(status)
  }}
>
  {status.toUpperCase()}
</span>
```

### Severity индикатор

```tsx
// ✅ Severity как левая полоска
<div className="flex items-center">
  <div 
    className="w-1 h-full rounded-l-lg"
    style={{ 
      backgroundColor: severityColor,
      boxShadow: `0 0 8px ${severityColor}40`
    }}
  />
  {/* Content */}
</div>
```

### Risk Score индикатор

```tsx
// ✅ Risk Score цветовая логика
const getRiskColor = (score: number): string => {
  if (score >= 70) return '#FF3B30'  // System red
  if (score >= 40) return '#FF9500'   // System orange
  return '#34C759'                    // System green
}
```

### Compliance Status индикатор

```tsx
// ✅ Compliance статус
const getComplianceColor = (status?: string): string => {
  const colors: Record<string, string> = {
    'compliant': '#34C759',
    'non-compliant': '#FF3B30',
    'warning': '#FF9500'
  }
  return colors[status || ''] || '#8E8E93'
}
```

### Severity индикатор для инцидентов

```tsx
// ✅ Severity цветовая логика для инцидентов безопасности
const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    'critical': '#FF3B30',  // System red
    'high': '#FF9500',      // System orange
    'medium': '#FFCC00',    // System yellow
    'low': '#007AFF'        // System blue
  }
  return colors[severity] || '#8E8E93'
}

// Использование в бейдже
<span 
  className="hig-badge"
  style={{
    backgroundColor: `${getSeverityColor(severity)}20`,
    color: getSeverityColor(severity)
  }}
>
  {severity.toUpperCase()}
</span>
```

### Предупреждения и алерты

```tsx
// ✅ Предупреждение об аномальной активности или критических событиях
{hasAnomalousActivity && (
  <div className="hig-card bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 border border-[#FF3B30]/30 p-4">
    <div className="flex items-center gap-3">
      <svg className="w-5 h-5 text-[#FF3B30] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <div>
        <div className="hig-body font-semibold text-[#FF3B30] mb-1">Warning Title</div>
        <div className="hig-caption text-gray-600 dark:text-gray-400">Warning description</div>
      </div>
    </div>
  </div>
)}
```

---

## 15. Разделители (Separators)

### Применение

```tsx
// ✅ Разделитель внутри карточки (border)
<div className="border-b border-gray-200 dark:border-gray-700/60 pb-4 mb-6">
  {/* Header */}
</div>

// ✅ Sticky status bar с разделителем
<div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-black/80 before:-z-10 hig-separator mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
  {/* Content */}
</div>
```

### Правила

- ✅ Используйте `border-b` или `border-t` для разделителей внутри карточек
- ✅ Используйте `.hig-separator` только для sticky headers
- ✅ Цвет границ: `border-gray-200 dark:border-gray-700/60`

---

## 16. Темная тема (Dark Mode)

### Принципы

- ✅ Всегда поддерживайте светлую и темную темы
- ✅ Используйте Tailwind классы: `dark:bg-[#1E293B]`, `dark:text-gray-100`
- ✅ Карточки в темной теме: `#1E293B` (темно-синий), не коричневый
- ✅ Границы: `dark:border-gray-700/60` для полупрозрачности

### Примеры

```tsx
// ✅ Правильно
<div className="bg-white dark:bg-[#1E293B]">
<div className="text-gray-900 dark:text-gray-100">
<div className="border-gray-200 dark:border-gray-700/60">
```

---

## 17. Детализированная информация в модальных окнах

### Структура модального окна с деталями

```tsx
<div className="hig-modal p-0 max-w-4xl w-full flex flex-col max-h-[90vh]">
  {/* Fixed Header */}
  <div className="sticky top-0 z-10 backdrop-blur-xl...">
    <h2 className="hig-headline">Title</h2>
    {/* Risk Indicator Bar */}
    <div className="h-1 rounded-full" style={{ backgroundColor: riskColor }} />
  </div>

  {/* Scrollable Content */}
  <div className="flex-1 overflow-y-auto px-6 py-6">
    {/* Метрические карточки */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric cards */}
    </div>

    {/* Детальная информация */}
    <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-700/60">
      {/* Info fields */}
    </div>

    {/* Compliance Issues (если есть) */}
    {issues && (
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
        <h3 className="hig-headline mb-4">Compliance Issues</h3>
        {issues.map(issue => (
          <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
            {/* Issue details */}
          </div>
        ))}
      </div>
    )}

    {/* Active Threats (если есть) */}
    {threats && (
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
        <h3 className="hig-headline mb-4">Active Threats</h3>
        {threats.map(threat => (
          <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
            {/* Threat details */}
          </div>
        ))}
      </div>
    )}

    {/* Предупреждение об аномальной активности (если есть) */}
    {hasAnomalousActivity && (
      <div className="hig-card bg-[#FF3B30]/10 dark:bg-[#FF3B30]/20 border border-[#FF3B30]/30 p-4">
        {/* Warning content */}
      </div>
    )}

    {/* Связанные инциденты безопасности (если есть) */}
    {relatedIncidents && relatedIncidents.length > 0 && (
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
        <h3 className="hig-headline mb-4">Related Security Incidents</h3>
        <div className="space-y-3">
          {relatedIncidents.map(incident => (
            <div className="hig-card bg-gray-50 dark:bg-[#334155]/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="hig-body font-semibold text-gray-900 dark:text-gray-100">{incident.title}</span>
                    <span 
                      className="hig-badge"
                      style={{
                        backgroundColor: `${getSeverityColor(incident.severity)}20`,
                        color: getSeverityColor(incident.severity)
                      }}
                    >
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="hig-caption text-gray-600 dark:text-gray-400 font-mono">{incident.id}</span>
                    <span className="hig-caption text-gray-400">•</span>
                    <span className="hig-caption text-gray-600 dark:text-gray-400">{incident.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* История активности (если есть) */}
    {recentActivity && recentActivity.length > 0 && (
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
        <h3 className="hig-headline mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700/60 last:border-0 last:pb-0">
              <div className="w-2 h-2 rounded-full bg-[#007AFF] mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="hig-body text-gray-900 dark:text-gray-100 font-medium mb-1">{activity.action}</div>
                <div className="flex items-center gap-2 flex-wrap hig-caption text-gray-600 dark:text-gray-400">
                  <span>{activity.timestamp}</span>
                  {activity.location && (
                    <>
                      <span>•</span>
                      <span>{activity.location}</span>
                    </>
                  )}
                  {activity.ip && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{activity.ip}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* Fixed Footer */}
  <div className="sticky bottom-0 z-10 backdrop-blur-xl...">
    {/* Action buttons */}
  </div>
</div>
```

### Правила

- ✅ Header содержит заголовок и индикатор риска (если применимо)
- ✅ Метрики отображаются в grid (2-4 колонки)
- ✅ Детальная информация структурирована с разделителями и заголовками секций (`.hig-headline`)
- ✅ Compliance Issues, Active Threats, Related Incidents, Recent Activity показываются только при наличии данных
- ✅ Предупреждения об аномальной активности отображаются в начале контента (после метрик)
- ✅ Секции с заголовками: используйте `.hig-headline mb-4` для заголовков секций
- ✅ История активности: используйте временные метки, IP-адреса и локацию с разделителями (`•`)
- ✅ Связанные инциденты: отображайте с severity бейджами и ID инцидента
- ✅ Footer содержит действия (кнопки)
- ✅ Все секции разделены `border-b` с правильными цветами

### Секции внутри модальных окон

```tsx
// ✅ Структура секции с заголовком
<div className="pb-4 border-b border-gray-200 dark:border-gray-700/60">
  <h3 className="hig-headline mb-4">Section Title</h3>
  {/* Section content */}
</div>

// ✅ Последняя секция (без border-b)
<div>
  <h3 className="hig-headline mb-4">Section Title</h3>
  {/* Section content */}
</div>
```

---

## 18. Sticky Status Bar

### Реализация sticky status bar

```tsx
// ✅ Sticky Status Bar с размытием
<div className="sticky top-16 z-40 before:absolute before:inset-0 before:backdrop-blur-xl before:bg-white/80 dark:before:bg-black/80 before:-z-10 hig-separator mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
  <div className="px-4 sm:px-6 lg:px-8 py-3">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center space-x-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse"></div>
          <span className="hig-caption font-semibold text-gray-900 dark:text-gray-100">
            Critical: {criticalCount}
          </span>
        </div>
        {/* More stats */}
      </div>
      <div className="hig-caption">
        Showing: {filteredCount} results
      </div>
    </div>
  </div>
</div>
```

### Правила

- ✅ Используйте `sticky top-16` для позиционирования под header
- ✅ Применяйте backdrop-blur для эффекта размытия
- ✅ Используйте `.hig-separator` для разделителя
- ✅ Показывайте ключевые метрики с цветными индикаторами
- ✅ Отображайте количество отфильтрованных результатов

---

## 19. Чеклист для новых страниц

При создании новой страницы в подразделе `/overview` убедитесь:

- [ ] Используется класс `.overview-dashboard` в layout
- [ ] Импортирован `overview-hig-style.css`
- [ ] Заголовок страницы: `.hig-title-large`
- [ ] Описание: `.hig-body`
- [ ] Карточки: `.hig-card` или `.hig-metric-card`
- [ ] Отступы кратны 8px
- [ ] Поддержка темной темы
- [ ] Нет hover эффектов с transform/scale
- [ ] Ссылки имеют hover эффект (фиолетовый `#AF52DE`)
- [ ] Используются CSS переменные для цветов
- [ ] Нет серых полосок (`.hig-separator`) внутри карточек (только для sticky headers)
- [ ] Модальные окна имеют фиксированные header и footer с размытием
- [ ] Контент в модальных окнах прокручивается между header и footer
- [ ] Для таблиц: используйте expandable details с другой информацией (не дублируйте базовые данные)
- [ ] Для длинных текстов: используйте `line-clamp-2` с `title` атрибутом
- [ ] Для пагинации: используйте HIG кнопки и показывайте счетчик результатов
- [ ] Для split-screen: основная часть 8/12, боковая панель 4/12 колонок
- [ ] Статусы используют системные цвета (#FF3B30, #34C759, #FF9500, #007AFF, #FFCC00)
- [ ] Primary кнопки используют `--svalbard-cobalt` (#393A84) с hover на `--svalbard-primary-purple` (#A655F7)

---

## 20. Файловая структура

```
app/
  overview/
    page.tsx              # Главная страница
    layout.tsx            # Layout с импортом CSS
    css/
      overview-hig-style.css  # Все HIG стили
```

---

## Заключение

Все страницы в `/overview` должны следовать этим принципам для обеспечения единообразного, минималистичного дизайна в стиле Apple HIG с цветовой схемой Svalbard. При возникновении вопросов обращайтесь к этому документу.

**Ключевые принципы:**
- Минимализм и чистота (Apple HIG)
- 8px grid system для отступов
- Цветовая схема Svalbard для брендинга
- Системные цвета для статусов и алертов
- Поддержка темной темы
- Без hover эффектов с transform/scale
- Плавные переходы и анимации

