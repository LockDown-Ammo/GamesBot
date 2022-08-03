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
                    min-width: 200px;
                    max-width: 980px;
                    margin: 0 auto;
                    padding: 45px;
                }
        
                @media (max-width: 767px) {
                    .markdown-body {
                        padding: 15px;
                    }
                }
                
                ${await githubMarkdownCSS.default({ dark: 'dark' })}
            </style>
            <div class="markdown-body">
                ${r}
            </div>`
            res.send(htmlData)
        } catch (e) {
            console.log(e)
        }
    })
}