import type { ArticleSummary } from '@/data/articles';

export interface BrandMark {
  label: string;
  src: string;
  kind: 'logo' | 'flag';
  pattern: RegExp;
}

const brandMarks: BrandMark[] = [
  { label: 'Apple', src: '/images/brands/apple.svg', kind: 'logo', pattern: /\b(apple|iphone|ipad|ios|macos|siri)\b/i },
  { label: 'DeepSeek', src: '/images/brands/deepseek.svg', kind: 'logo', pattern: /\bdeepseek\b/i },
  { label: 'OpenAI', src: '/images/brands/openai.svg', kind: 'logo', pattern: /\b(openai|chatgpt|gpt[-\s]?\d|codex)\b/i },
  { label: 'Anthropic', src: '/images/brands/anthropic.svg', kind: 'logo', pattern: /\b(anthropic|claude)\b/i },
  { label: 'Google', src: '/images/brands/google.svg', kind: 'logo', pattern: /\b(google|gemini|deepmind)\b/i },
  { label: 'Mistral AI', src: '/images/brands/mistralai.svg', kind: 'logo', pattern: /\bmistral\b/i },
  { label: 'Microsoft', src: '/images/brands/microsoft.png', kind: 'logo', pattern: /\b(microsoft|azure|copilot)\b/i },
  { label: 'NVIDIA', src: '/images/brands/nvidia.svg', kind: 'logo', pattern: /\b(nvidia|nemotron|cuda|vera rubin)\b/i },
  { label: 'Meta', src: '/images/brands/meta.svg', kind: 'logo', pattern: /\b(meta|llama)\b/i },
  { label: 'Qwen', src: '/images/brands/qwen.svg', kind: 'logo', pattern: /\bqwen\b/i },
  { label: 'Alibaba Cloud', src: '/images/brands/alibabacloud.svg', kind: 'logo', pattern: /\b(alibaba|alibabacloud)\b/i },
  { label: 'Nous Research', src: '/images/brands/nousresearch.png', kind: 'logo', pattern: /\b(nous research|hermes agent|hermes)\b/i },
  { label: 'Hugging Face', src: '/images/brands/huggingface.svg', kind: 'logo', pattern: /\bhugging\s?face\b/i },
  { label: 'GitHub', src: '/images/brands/github.svg', kind: 'logo', pattern: /\bgithub\b/i },
  { label: 'Kimi', src: '/images/brands/kimi.svg', kind: 'logo', pattern: /\b(kimi|moonshot)\b/i },
  { label: 'Amazon Web Services', src: '/images/brands/amazonwebservices.svg', kind: 'logo', pattern: /\b(amazon|aws)\b/i },
  { label: 'Stripe', src: '/images/brands/stripe.svg', kind: 'logo', pattern: /\bstripe\b/i },
  { label: 'PayPal', src: '/images/brands/paypal.svg', kind: 'logo', pattern: /\bpaypal\b/i },
  { label: 'TypeScript', src: '/images/brands/typescript.svg', kind: 'logo', pattern: /\btypescript\b/i },
  { label: 'Bun', src: '/images/brands/bun.svg', kind: 'logo', pattern: /\bbun\b/i },
  { label: 'Debian', src: '/images/brands/debian.svg', kind: 'logo', pattern: /\bdebian\b/i },
  { label: 'Union européenne', src: '/images/flags/eu.svg', kind: 'flag', pattern: /\b(union européenne|european union|eu ai act|ai act|europe|européen|européenne)\b/i },
  { label: 'France', src: '/images/flags/fr.svg', kind: 'flag', pattern: /\b(france|français|française)\b/i },
  { label: 'Chine', src: '/images/flags/cn.svg', kind: 'flag', pattern: /\b(chine|chinois|chinoise|china)\b/i },
  { label: 'États-Unis', src: '/images/flags/us.svg', kind: 'flag', pattern: /\b(états-unis|américain|américaine|washington|united states)\b/i },
  { label: 'Royaume-Uni', src: '/images/flags/gb.svg', kind: 'flag', pattern: /\b(royaume-uni|britannique|united kingdom)\b/i },
  { label: 'Allemagne', src: '/images/flags/de.svg', kind: 'flag', pattern: /\b(allemagne|allemand|allemande|germany)\b/i },
];

export function getArticleBrandMarks(article: ArticleSummary) {
  const text = `${article.title} ${article.excerpt}`;
  return brandMarks
    .map((mark) => ({ mark, index: text.search(mark.pattern) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index || (a.mark.kind === 'logo' ? -1 : 1))
    .map(({ mark }) => mark)
    .filter((mark, index, marks) => marks.findIndex((candidate) => candidate.src === mark.src) === index)
    .slice(0, 4);
}
