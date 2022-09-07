import express from 'express';
import {updateUser, getData} from './handleUsers.js';

process.on("unhandledRejection",console.log)
process.on("unhandledException",console.log)

const wait = ()=>{
  return new Promise((r)=>{
    setTimeout(r,2000)
  })
}

;(async()=>{
  while(true){
    let d = getData()
    for (let a in d) {
      await wait()
      updateUser(d[a].u)
    }
  }
})();

const app = express();

app.get(`/data`,(req,res)=>{
  res.json(getData())
})

app.get(`/add/:username`,(req,res)=>{
  updateUser(req.params.username).then(()=>{
    console.log(`Added ${req.params.username}`)
    res.send(`Added!`)
  }).catch(()=>{
    res.status(404)
    res.send(`User not found`)
  })
})

app.use(express.static('./public'))

app.listen(0,console.log(`Server up`));