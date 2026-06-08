import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, ChevronDown, ChevronUp, CheckCircle, Sparkles } from 'lucide-react';

interface RedeemPointsProps {
  userId: number | null;
  listingPrice: number;
  onApply: (discount: number, pointsUsed: number) => void;
  onRemove: () => void;
  applied: boolean;
}

const POINTS_TO_RUPEE = 1; // 1 point = ₹1
const MAX_REDEEM_PERCENT = 0.5; // max 50% of price

export default function RedeemPoints({
  userId,
  listingPrice,
  onApply,
  onRemove,
  applied,
}: RedeemPointsProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [pointsInput, setPointsInput] = useState('');
  const [error, setError] = useState('');

  const maxRedeemable = Math.min(
    balance ?? 0,
    Math.floor(listingPrice * MAX_REDEEM_PERCENT)
  );
  const maxDiscount = maxRedeemable * POINTS_TO_RUPEE;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/points?userId=${userId}`)
      .then(r => r.json())
      .then(d => setBalance(d.balance ?? 0))
      .catch(() => setBalance(0));
  }, [userId]);

  const handleApplyAll = () => {
    if (!balance || balance === 0) return;
    setError('');
    onApply(maxDiscount, maxRedeemable);
    setPointsInput(String(maxRedeemable));
  };

  const handleApplyCustom = () => {
    const pts = parseInt(pointsInput);
    if (isNaN(pts) || pts <= 0) {
      setError('Enter a valid number of points');
      return;
    }
    if (pts > (balance ?? 0)) {
      setError(`You only have ${balance} points`);
      return;
    }
    const cappedPts = Math.min(pts, maxRedeemable);
    const discount = cappedPts * POINTS_TO_RUPEE;
    setError('');
    onApply(discount, cappedPts);
  };

  const handleRemove = () => {
    setPointsInput('');
    setError('');
    onRemove();
  };

  if (!userId || balance === null) return null;

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/50 transition-colors duration-150"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <Coins size={15} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-foreground leading-tight">Campus Points</p>
            <p className="text-xs text-muted-foreground">
              {balance === 0
                ? 'No points yet'
                : `${balance} pts available · save up to ₹${maxDiscount}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {applied && (
            <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle size={12} /> Applied
            </span>
          )}
          {expanded ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 bg-muted/30 border-t border-border">
              {balance === 0 ? (
                <div className="text-center py-3">
                  <Sparkles size={20} className="text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground">
                    Earn points by posting listings and completing sales!
                  </p>
                </div>
              ) : applied ? (
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      ₹{maxDiscount} discount applied
                    </p>
                    <p className="text-xs text-muted-foreground">{maxRedeemable} points used</p>
                  </div>
                  <button
                    onClick={handleRemove}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  {/* Quick apply all */}
                  <button
                    onClick={handleApplyAll}
                    disabled={balance === 0}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors mb-3 disabled:opacity-50"
                  >
                    <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
                      Use all {maxRedeemable} points
                    </span>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      −₹{maxDiscount}
                    </span>
                  </button>

                  {/* Custom amount */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        min={1}
                        max={maxRedeemable}
                        value={pointsInput}
                        onChange={e => { setPointsInput(e.target.value); setError(''); }}
                        placeholder={`1 – ${maxRedeemable} pts`}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                    <button
                      onClick={handleApplyCustom}
                      disabled={!pointsInput}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Max 50% of item price · 1 pt = ₹1
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
