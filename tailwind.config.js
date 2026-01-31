/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind CSS がスキャンするファイルを指定します。
  // ここに指定されたファイル内のクラス名に基づいて、最終的なCSSが生成されます。
  content: [
    './public/**/*.html', // publicディレクトリ以下の全てのHTMLファイル
    './public/js/**/*.js', // public/jsディレクトリ以下の全てのJavaScriptファイル
    './src/**/*.{vue,js,ts,jsx,tsx}', // (既存のVue/Reactプロジェクト向けパスがあれば維持)
  ],

  // No prefix to match standard Tailwind classes in index.html
  // prefix: 'kamos-',

  // Tailwindのデフォルトテーマを拡張し、Kamosデザインシステムの値を組み込みます。
  theme: {
    extend: {
      // KamosのスペーシングトークンをTailwindのspacingスケールに追加します。
      // また、2px刻みで100pxまでの値を動的に生成します。
      spacing: {
        'xs': 'var(--kamos-space-xs)',
        'sm': 'var(--kamos-space-sm)',
        'md': 'var(--kamos-space-md)',
        'lg': 'var(--kamos-space-lg)',
        'xl': 'var(--kamos-space-xl)',
        '2xl': 'var(--kamos-space-2xl)', // 40px
        '3xl': 'var(--kamos-space-3xl)', // 48px
        // 2px刻みで100pxまでの値を動的に追加
        ...Array.from({ length: 51 }, (_, i) => i * 2).reduce((acc, px) => {
          acc[`${px}px`] = `${px}px`; // 例: '2px': '2px', '4px': '4px', ... '100px': '100px'
          return acc;
        }, {}),
      },

      // KamosのフォントサイズトークンをTailwindのfontSizeスケールに追加します。
      fontSize: {
        'h1': 'var(--kamos-font-size-h1)',
        'h2': 'var(--kamos-font-size-h2)',
        'h3': 'var(--kamos-font-size-h3)',
        'body': 'var(--kamos-font-size-body)',
        'lg': 'var(--kamos-font-size-lg)',
        'small': 'var(--kamos-font-size-small)',
        'xs': 'var(--kamos-font-size-xs)',
      },

      // KamosのボーダーラジアストークンをTailwindのborderRadiusスケールに追加します。
      borderRadius: {
        'sm': 'var(--kamos-border-radius-sm)',
        'md': 'var(--kamos-border-radius-md)',
        'lg': 'var(--kamos-border-radius-lg)',
      },

      // KamosのシャドウトークンをTailwindのboxShadowスケールに追加します。
      boxShadow: {
        'sm': 'var(--kamos-box-shadow-sm)',
        'md': 'var(--kamos-box-shadow-md)',
        'lg': 'var(--kamos-box-shadow-lg)',
        'focus': 'var(--kamos-box-shadow-focus)',
        'card': 'var(--kamos-box-shadow-card)',
      },

      // KamosのフォントファミリートークンをTailwindのfontFamilyに追加します。
      fontFamily: {
        'base': 'var(--kamos-font-family-base)',
        'english': 'var(--kamos-font-family-english)',
        'japanese': 'var(--kamos-font-family-japanese)',
        'display': ['Josefin Sans', 'Noto Sans JP', 'sans-serif'],
        'sans': ['Josefin Sans', 'Noto Sans JP', 'sans-serif'],
      },

      // KamosのフォントウェイトトークンをTailwindのfontWeightスケールに追加します。
      // kamos-ui.cssで頻繁に使用される数値をマッピングします。
      fontWeight: {
        'light': 300, // Light
        'normal': 400, // Regular
        'medium': 500, // Medium (kamos-ui.cssで一部使用)
        'semibold': 600, // SemiBold (kamos-ui.cssで多く使用)
        'bold': 700, // Bold (kamos-ui.cssで多く使用)
        'extrabold': 800, // ExtraBold
        'black': 900, // Black
      },

      // Kamosのトランジション関連のトークンを追加します。
      transitionDuration: {
        'short': 'var(--kamos-transition-duration-short)',
        'medium': 'var(--kamos-transition-duration-medium)',
        'long': 'var(--kamos-transition-duration-long)',
      },
      transitionTimingFunction: {
        'kamos-organic-bounce': 'var(--kamos-transition-timing-function-kamos-organic-bounce)',
        'kamos-ease-out': 'var(--kamos-transition-timing-function-kamos-ease-out)',
      },
      lineHeight: {
        'base': 'var(--kamos-line-height-base)',
      },
    },
  },

  // Tailwindのバリアント（hover, focusなど）を有効にします。
  variants: {
    extend: {},
  },

  // Kamosカスタムユーティリティクラスがパージされないようにsafelistを設定します。
  // これにより、CSSファイルに直接記述されたkamos-プレフィックスのクラスが保持されます。
  safelist: [
    // スペーシングユーティリティ (既存)
    {
      pattern: /kamos-(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-(xs|sm|md|lg|xl|2xl|3xl)/,
    },
    {
      pattern: /kamos-mx-auto/,
    },
    // 新しく追加される2px刻みのスペーシングユーティリティ
    {
      pattern: /kamos-(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-\d+px/, // p-2px, m-10px など
      variants: ['responsive'], // 必要に応じてレスポンシブバリアントも追加
    },
    // 絶対位置決めユーティリティ (top, right, bottom, left)
    {
      pattern: /kamos-(top|right|bottom|left)-\d+px/, // top-2px, left-50px など
      variants: ['responsive'],
    },
    {
      pattern: /kamos--(translate-x|translate-y)-1\/2/, // kamos--translate-x-1/2 のような負の値にも対応
      variants: ['responsive'],
    },
    // レイアウトユーティリティ (既存)
    'kamos-block',
    'kamos-inline-block',
    'kamos-inline',
    'kamos-flex',
    'kamos-inline-flex',
    'kamos-grid',
    'kamos-hidden',
    'kamos-flex-row',
    'kamos-flex-col',
    'kamos-flex-wrap',
    'kamos-flex-nowrap',
    'kamos-items-start',
    'kamos-items-end',
    'kamos-items-center',
    'kamos-items-baseline',
    'kamos-items-stretch',
    'kamos-justify-start',
    'kamos-justify-end',
    'kamos-justify-center',
    'kamos-justify-between',
    'kamos-justify-around',
    'kamos-justify-evenly',
    'kamos-flex-grow',
    'kamos-flex-shrink',
    'kamos-flex-none',
    {
      pattern: /kamos-gap-(xs|sm|md|lg|xl|2xl|3xl)/,
    },
    'kamos-w-full',
    'kamos-max-w-full',
    'kamos-min-w-0',
    'kamos-h-full',
    'kamos-min-h-screen',
    'kamos-max-h-full',
    // テキストアラインユーティリティ (既存)
    'kamos-text-left',
    'kamos-text-center',
    'kamos-text-right',
    'kamos-text-justify',
    // Vertical Alignユーティリティ (既存)
    'kamos-align-baseline',
    'kamos-align-top',
    'kamos-align-middle',
    'kamos-align-bottom',
    'kamos-align-text-top',
    'kamos-align-text-bottom',
    // テキストデコレーションユーティリティ (追加)
    'kamos-underline',
    'kamos-overline',
    'kamos-line-through',
    'kamos-no-underline',
    // テキストトランスフォームユーティリティ (追加)
    'kamos-uppercase',
    'kamos-lowercase',
    'kamos-capitalize',
    'kamos-normal-case',
    // ホワイトスペースユーティリティ (追加)
    'kamos-whitespace-normal',
    'kamos-whitespace-nowrap',
    'kamos-whitespace-pre',
    'kamos-whitespace-pre-line',
    'kamos-whitespace-pre-wrap',
    // ワードブレイクユーティリティ (追加)
    'kamos-break-normal',
    'kamos-break-words',
    'kamos-break-all',
    // ボーダーユーティリティ (既存 + border-widthのパターン追加)
    'kamos-border',
    'kamos-border-t',
    'kamos-border-r',
    'kamos-border-b',
    'kamos-border-l',
    'kamos-border-0',
    {
      pattern: /kamos-border-(x|y|t|r|b|l)-0/, // border-x-0, border-y-0なども
    },
    {
      pattern: /kamos-border-(2|4|8)/, // border-2, border-4, border-8など
    },
    'kamos-border-primary',
    'kamos-border-secondary',
    'kamos-border-default',
    'kamos-border-light',
    'kamos-border-focus',
    'kamos-border-error',
    // オパシティユーティリティ (追加)
    {
      pattern: /kamos-opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)/,
    },
    // カーソルユーティリティ (追加)
    'kamos-cursor-auto',
    'kamos-cursor-default',
    'kamos-cursor-pointer',
    'kamos-cursor-wait',
    'kamos-cursor-text',
    'kamos-cursor-move',
    'kamos-cursor-help',
    'kamos-cursor-not-allowed',
    // フォントウェイトユーティリティ (既存)
    'kamos-font-light',
    'kamos-font-normal',
    'kamos-font-medium',
    'kamos-font-semibold',
    'kamos-font-bold',
    'kamos-font-extrabold',
    'kamos-font-black',
  ],

  // プラグインは必要に応じて追加します。
  plugins: [],
};
