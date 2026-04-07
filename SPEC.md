# CRM Kanban System - Specification

## 1. Project Overview

- **Project name**: CRM Kanban
- **Type**: Web Application (Next.js)
- **Core functionality**: Канбан-доска для управления воронкой продаж с возможностью создания сделок, перемещения между этапами, назначения ответственных
- **Target users**: Менеджеры по продажам, владельцы бизнеса

## 2. UI/UX Specification

### Layout Structure

- **Header**: Logo, название приложения, кнопка "Новая сделка"
- **Main**: Канбан-доска с горизонтальной прокруткой этапов
- **Sidebar** (опционально): Фильтры, настройки

### Responsive Breakpoints

- Desktop: > 1024px - полная канбан доска
- Tablet: 768-1024px - компактные карточки
- Mobile: < 768px - вертикальный список этапов

### Visual Design

**Color Palette**:
- Background: `#0f0f0f` (тёмный фон)
- Surface: `#1a1a1a` (карточки, колонки)
- Surface hover: `#252525`
- Border: `#2a2a2a`
- Primary: `#22c55e` (зелёный - успех, продажи)
- Accent: `#3b82f6` (синий - действия)
- Text primary: `#ffffff`
- Text secondary: `#a1a1a1`
- Danger: `#ef4444`

**Stage Colors** (воронка продаж):
- New: `#6366f1` (indigo)
- Contact: `#8b5cf6` (violet)
- Proposal: `#f59e0b` (amber)
- Negotiation: `#f97316` (orange)
- Won: `#22c55e` (green)
- Lost: `#ef4444` (red)

**Typography**:
- Font family: "Geist", system-ui, sans-serif
- Headings: 24px (h1), 18px (h2), 16px (h3)
- Body: 14px
- Small: 12px

**Spacing**:
- Base unit: 4px
- Card padding: 16px
- Column gap: 16px
- Card gap: 8px

**Visual Effects**:
- Card shadow: `0 2px 8px rgba(0,0,0,0.3)`
- Hover: slight scale (1.02) + border glow
- Drag: opacity 0.8 + rotate 2deg

### Components

1. **KanbanColumn**
   - Заголовок с названием этапа и счётчиком
   - Область для карточек с drag-and-drop
   - Кнопка добавления карточки

2. **DealCard**
   - Название сделки
   - Сумма (опционально)
   - Имя клиента
   - Теги (опционально)
   - Дата создания/обновления

3. **NewDealModal**
   - Форма создания новой сделки
   - Поля: название, клиент, сумма, этап

## 3. Functionality Specification

### Core Features

1. **Управление этапами (Columns)**
   - Просмотр всех этапов воронки
   - Перетаскивание сделок между этапами
   - Счётчик количества сделок на этапе

2. **Управление сделками (Deals)**
   - Создание новой сделки
   - Редактирование сделки
   - Удаление сделки
   - Drag-and-drop между этапами

3. **Данные сделки**
   - Название (required)
   - Клиент (required)
   - Сумма (optional)
   - Этап (required)
   - Описание (optional)
   - Теги (optional)
   - Дата создания
   - Дата обновления

### User Interactions

- Клик по карточке → открыть детали
- Drag карточки → перемещение между этапами
- Клик "Новая сделка" → открыть модалку
- Клик на этапе → фильтрация

### Data Handling

- SQLite + Drizzle ORM для хранения
- Server Actions для мутаций
- Drag-and-drop с @dnd-kit

### Edge Cases

- Пустая доска → показать онбординг
- Много карток → виртуализация (опционально)
- Ошибки сохранения → toast уведомление

## 4. Acceptance Criteria

1. ✅ Отображается канбан-доска с 6 этапами по умолчанию
2. ✅ Можно создать новую сделку через форму
3. ✅ Можно перетаскивать сделки между этапами
4. ✅ Сделки сохраняются в базе данных
5. ✅ Drag-and-drop работает плавно
6. ✅ Дизайн соответствует спецификации (тёмная тема)
7. ✅ Адаптивная верстка
8. ✅ Нет ошибок при typecheck и lint
