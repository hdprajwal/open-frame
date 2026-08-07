import { useNavigate, useParams } from 'react-router-dom';
import { format, plural, useLocale } from '@/lib/use-locale';
import { LibraryPage } from '../components/library-page';
import { ThemeDetail } from '../components/themes/theme-detail';
import { ThemesGallery } from '../components/themes/themes-gallery';
import { themes as themeRegistry } from '../lib/themes';

export function ThemesGalleryPage() {
  const t = useLocale();
  const count = themeRegistry.length;
  return (
    <LibraryPage title={t.themes.title} count={format(plural(count, t.home.themeCount), { count })}>
      <ThemesGallery />
    </LibraryPage>
  );
}

export function ThemeDetailPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  if (!themeId) return null;
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-8 md:px-10 md:py-12">
        <ThemeDetail themeId={themeId} onBack={() => navigate('/themes')} />
      </div>
    </div>
  );
}
