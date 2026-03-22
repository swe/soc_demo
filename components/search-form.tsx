import Icon from '@/components/ui/icon'

export default function SearchForm({ placeholder = 'Search…' }: { placeholder?: string }) {
  return (
    <form className="relative">
      <label htmlFor="action-search" className="sr-only">Search</label>
      <input id="action-search" className="form-input pl-9 bg-white dark:bg-gray-800" type="search" placeholder={placeholder} />
      <button className="absolute inset-0 right-auto group" type="submit" aria-label="Search">
        <Icon
          name="search-outline"
          className="shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-3 mr-2 w-4 h-4"
        />
      </button>
    </form>
  )
}
