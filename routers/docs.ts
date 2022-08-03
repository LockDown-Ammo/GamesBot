import fs from 'fs'

export default async (app: any) => {
  app.get('/docs', (req: any, res: any) => {
    const data = fs.readFileSync('./README.md')
    res.send(data.toString()).catch((e: any) => console.log(e));
  })
}