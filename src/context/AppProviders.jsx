import { ProfileProvider } from './ProfileContext'
import { CategoriesProvider } from './CategoriesContext'
import { FoodsProvider } from './FoodsContext'
import { DailyLogsProvider } from './DailyLogsContext'

export function AppProviders({ children }) {
  return (
    <ProfileProvider>
      <CategoriesProvider>
        <FoodsProvider>
          <DailyLogsProvider>{children}</DailyLogsProvider>
        </FoodsProvider>
      </CategoriesProvider>
    </ProfileProvider>
  )
}
