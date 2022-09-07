import { GraphQL } from '@rayhanadev/replit-gql';
import gql from 'graphql-tag';
import * as fs from 'fs';
const client = GraphQL()

let data;

try {
  data = require('./data.json')
} catch {
  try {
    data = require('./dataBackup.json')
  } catch {
    console.error(`Data + DataBackup corrupted or non-existent`)
    process.exit(1)
  }
}

export function updateUser(un) {
  return new Promise((res, rej) => {
    fetch("https://replit.com/graphql?a="+Math.random(), {
      "cache": "no-cache",
      "headers": {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Referrer': 'https://replit.com/',
        'Cookie': '',
      },
      "body": JSON.stringify({"operationName":"userByUsername","variables":{"username":un},"query":"query userByUsername($username: String!) { userByUsername(username: $username) { id username followerCount __typename }}"}),
      "method": "POST"
    }).then(async(r) => {
      if(!r.status==200){
        rej()
        return;
      }
      r = await r.json()
      if(!r.data || !r.data.userByUsername){
        rej()
        return;
      }
      if (r.data.userByUsername) {
        let re = r.data.userByUsername
        if (data[re.id]) {
          data[re.id].u = re.username
          data[re.id].f = re.followerCount

          if (data[re.id].l !== new Date().getHours()) {
            data[re.id].l = new Date().getHours()
            data[re.id].d.push(re.followerCount)
            if (data[re.id].d.length > 24) {
              data[re.id].d.shift()
            }
          }
        } else {
          data[re.id] = {
            u: re.username,
            f: re.followerCount,
            d: [re.followerCount],
            l: new Date().getHours()
          }
        }
        console.log(`Updated ${r.data.userByUsername.username}`)
        res()
      } else {
        rej()
      }
    }).catch(rej)
  })
}

export function getData() { return data };

setInterval(() => {
  fs.writeFileSync(`./data.json`, JSON.stringify(data))
  setTimeout(() => {
    fs.writeFileSync(`./dataBackup.json`, JSON.stringify(data))
  }, 30000)
}, 60000)