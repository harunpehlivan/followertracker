let cht = document.getElementById('chart')
let chtContainer = document.getElementById('can')

let labels = [];
let nlabels = []

let data = {
  labels: labels,
  datasets: [{
    label: 'Current followers',
    backgroundColor: 'rgb(66, 135, 245)',
    borderColor: 'rgb(66, 191, 245)',
    data: [],
    borderRadius: 5,
  }, {
    label: '24 Hour prediction',
    backgroundColor: 'rgb(48, 209, 104)',
    borderColor: 'rgb(92, 242, 144)',
    data: [],
    borderRadius: 5,
  }, {
    label: '24 Hours ago',
    backgroundColor: 'rgb(242, 157, 92)',
    borderColor: 'rgb(204, 129, 71)',
    data: [],
    borderRadius: 5,
  }]
};

function updateData() {
  fetch(`data`).then(async (r) => {
    if (r.status == 200) {
      r = await r.json()
      let sortable = [];
      for (var a in r) {
        sortable.push(r[a]);
      }

      sortable.sort((a, b) => { return b.f - a.f })

      data.datasets[0].data = []
      data.datasets[1].data = []
      data.datasets[2].data = []
      labels = []
      nlabels = []
      let gains = []
      for (let i = 0; i < sortable.length; i++) {
        nlabels.push(sortable[i].u)
        if(!(sortable[i].f > 5))continue;
        labels.push(sortable[i].u)
        data.datasets[0].data.push(sortable[i].f)
        data.datasets[1].data.push(sortable[i].f + (sortable[i].f - sortable[i].d[0]))
        data.datasets[2].data.push(sortable[i].d[0])
        gains.push({
          u: sortable[i].u,
          g: (sortable[i].f - sortable[i].d[0])
        })
      }
      data.labels = labels
      chart.update();
      chart.resize(window.innerWidth - 50, (labels.length * 100) + 50);

      gains.sort((a, b) => { return b.g - a.g })
      document.getElementById("trending").innerText = `${gains[0].u} gained ${gains[0].g} followers in the past 24 hours with ${gains[1].u} in a close second of ${gains[1].g} followers!`
    }
  }).catch(() => { })
}
updateData()
setInterval(updateData, 7500)

const config = {
  plugins: [ChartDataLabels],
  type: 'bar',
  data: data,
  options: {
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      y: {
        ticks: {
          callback: function(value, index, ticks) {
              return `${index+1}: ${labels[index]}`;
          },
          font: {
            size: 16,
            family: 'Monospace',
            style: "italic"
          },
          color: "grey",
          listeners: {
            click: console.log
          }
        }
      }
    },
    elements: {
      bar: {
        borderWidth: 2,
      }
    },
    responsive: false,
    plugins: {
      title: {
        display: true,
        text: 'Follower counts of Replit users',
        font: {
          size: 20,
          family: 'Monospace'
        }
      },
      legend: {
        labels: {
          font: {
            size: 13,
            family: 'Monospace'
          }
        }
      },
      datalabels: {
        color: 'black',
        anchor: 'end',
        align: 'end',
        labels: {
          value: {
            color: 'grey'
          }
        }
      }
    },
  },
};

const chart = new Chart(
  cht,
  config
);

// Resizing
window.addEventListener('resize', function(event) {
  chart.resize(window.innerWidth - 50, (labels.length * 100) + 50);
}, true);

chart.resize(window.innerWidth - 50, (labels.length * 100) + 50);

// Darkmode
const options = {
  label: '🌓'
}

const darkmode = new Darkmode(options);
darkmode.showWidget();

// Adding
function add(){
  let d = false
  for(let i=0;i<labels.length;i++){
    if(labels[i].toLowerCase() == document.getElementById('userInput').value.toLowerCase()){
      window.scroll({
       top: (i*100)+50, 
       left: 0, 
       behavior: 'smooth' 
      });
      d = true;
      break;
    }
  }
  if(nlabels.includes(document.getElementById('userInput').value) && !d){
    document.getElementById('added').innerText = `Account added but doesn't have over 5 followers.`
    d = true
  }
  if(!d){
    document.getElementById('added').innerText = `Adding...`
    fetch(`/add/${document.getElementById('userInput').value}`).then((r)=>{
      if(r.status == 200){
        document.getElementById('added').innerText = `Updating data...`
        updateData()
        setTimeout(()=>{
          document.getElementById('added').innerText = `Anyone who uses @gdaybot will also be added.`
          add()
        },1000)
      }else{
        document.getElementById('added').innerText = `User not found`
      }
    }).catch(()=>{
      document.getElementById('added').innerText = `User not found`
    })
  }
}

document.getElementById('userInput').addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      add()
    }
});