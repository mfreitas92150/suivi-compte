import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useMonthNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const month = useMemo(() => {
    const m = searchParams.get('month');
    return m ? parseInt(m, 10) : new Date().getMonth() + 1;
  }, [searchParams]);

  const year = useMemo(() => {
    const y = searchParams.get('year');
    return y ? parseInt(y, 10) : new Date().getFullYear();
  }, [searchParams]);

  const setMonthAndYear = useCallback((newMonth: number, newYear: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', newMonth.toString());
    params.set('year', newYear.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const currentDate = useMemo(() => {
    return new Date(year, month - 1, 1);
  }, [month, year]);

  const setDate = useCallback((date: Date) => {
    setMonthAndYear(date.getMonth() + 1, date.getFullYear());
  }, [setMonthAndYear]);

  return {
    month,
    year,
    currentDate,
    setDate,
    setMonthAndYear,
  };
}
