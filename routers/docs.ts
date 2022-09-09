import fs from 'fs'
import md from 'markdown-it'
const marked = md({
  html: true,
  linkify: true,
  typographer: true,
  langPrefix: '',
});
export default async (app: any) => {

  const githubMarkdownCSS = await import('generate-github-markdown-css')
  app.get('/docs', async (req: any, res: any) => {
    res.set({
      'Access-Control-Allow-Origin': '*'
    })
    try {
      const data = fs.readFileSync('./README.md')
      const r = marked.render(data.toString())
      const htmlData =
        `<style>
                 body {
                   background-color: #0d1117
                }
                .markdown-body {
                    box-sizing: border-box;
                    margin: 0 auto;
                    padding: 45px;
                }
        
                @media (max-width: 767px) {
                    .markdown-body {
                        padding: 15px;
                    }
                }
                ${fs.readFileSync('./githubMarkDown.css').toString()}
            </style>
            <link rel="stylesheet" href="githubMarkDown.css">
            <link rel="stylesheet" href="https://raw.githubusercontent.com/sindresorhus/github-markdown-css/main/github-markdown.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css">
		<style>
			.github-fork-ribbon:before {
				background-color: #121612;
			}
		</style>
            <article class="markdown-body">
                ${r}
            </article>`
      res.send(htmlData)
    } catch (e) {
      console.log(e)
      res.send(
        'Sorry an internal error occured and CSS couldnt be loaded... ( or maybe something worse )' +
        marked.render(fs.readFileSync('./README.md').toString())
      )
    }
  })
}