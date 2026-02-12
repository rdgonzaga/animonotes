import { AlertCircle } from 'lucide-react';

export function AnonDisclaimer() {
  return (
    <div className="rounded-lg border border-rose-500 dark:border-orange-800 bg-rose-100 dark:bg-orange-900/20 p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-rose-700 dark:text-orange-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-rose-900 dark:text-orange-200 mb-1">True Anonymity</h3>
          <p className="text-sm text-stone-900 dark:text-orange-300 leading-relaxed">
            Posts in this section are <strong>completely anonymous</strong>. Your identity is never
            stored in our database, and even administrators cannot reveal who posted what. You can
            edit or delete your posts only from this browser session (tracked via cookies). Voting
            is not anonymous - your votes are linked to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
