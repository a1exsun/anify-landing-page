/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 200],
    'header-min-length': [2, 'always', 80],
    'subject-leading-capital': [2, 'always'],
    'body-empty': [2, 'always'],
    'footer-empty': [2, 'always'],
    'subject-case': [2, 'always', ['sentence-case']],
    'no-chinese': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'header-min-length': ({ header }, _when = 'always', value = 0) => {
          const headerLength = header?.length ?? 0
          return [
            headerLength >= value,
            `Header must be at least ${value} characters long`,
          ]
        },
        'subject-leading-capital': ({ subject }) => {
          if (!subject) {
            return [false, 'Subject is required']
          }

          const firstChar = subject.charAt(0)
          const isUpperCase = /^[A-Z]/.test(firstChar)

          return [
            isUpperCase,
            'Subject must start with an uppercase letter (e.g., "feat: Add feature" not "feat: add feature")',
          ]
        },
        'no-chinese': ({ header, body, footer }) => {
          const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/
          const texts = [header, body, footer].filter(Boolean)
          const hasChinese = texts.some((text) => chineseRegex.test(text))
          return [
            !hasChinese,
            'Commit message must not contain Chinese characters',
          ]
        },
      },
    },
  ],
}
