import fs from 'fs'
export default async (app: any) => {
  app.get('/githubMarkDown.css', async (req: any, res: any) => {
    res.set({
      'Access-Control-Allow-Origin': '*'
    })
    try {
    const data = fs.readFileSync('./githubMarkDown.css').toString()
      res.send(data)
    } catch (e) {
      console.log(e)
      res.send(
        'Sorry an internal error occured and CSS couldnt be loaded... ( or maybe something worse )'
      )
    }
  })
}