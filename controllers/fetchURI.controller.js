const { createCustomError } = require("../errors/customAPIError")
const path = require('path')
const puppeteer = require('puppeteer')
const fetchURI = async(req ,res ,next)=>{
  const uri = req.body.uri
  const type = req.body.type
  const browser = await puppeteer.launch({
    headless:true,
    args: ["--no-sandbox"]
  });
    try{
        const page = await browser.newPage();
        console.log('open page')
        await page.goto(`${uri}`,{
          waitUntil:'networkidle2'
        });
        console.log('going to url')
        const dimensions = await page.evaluate(() => {
          return {
            width: 1920,
            height: document.body.scrollHeight,
          };
        });

            console.log(dimensions.height)
            const filename = Date.now()+''
            page.setViewport({ width: (type=='mobile')? 425 :  dimensions.width, height: dimensions.height })
            await page.screenshot({
              path: path.join(__dirname ,`../public/`,`${filename}`) +".png",
              type:"png",
              fullPage: (type=='mobile')? false : true
            });

            console.log('page close')
            res.json(`/public/${filename}.png`)
            await browser.close();

    }
    catch(err){
            console.log(err)
      await browser.close();
        next(createCustomError(err,400));
    }
}

module.exports = {fetchURI}