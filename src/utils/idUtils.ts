/**
 * idUtils.ts — ユニークID生成ユーティリティ
 * タイムスタンプ + ランダム文字列を組み合わせて衝突しにくいIDを生成する
 */

/** タイムスタンプとランダム文字列を組み合わせたユニークIDを返す */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
