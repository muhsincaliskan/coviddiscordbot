const covid = require('novelcovid')
const Discord = require("discord.js")
const { localize, localizeCountry } = require("../translations/translate.js")
const { CanvasRenderService } = require('chartjs-node-canvas');
const setup = (ChartJS) => {
    ChartJS.defaults.global.defaultFontColor = '#fff'
    ChartJS.defaults.global.defaultFontStyle = 'bold'
    ChartJS.defaults.global.defaultFontFamily = 'Helvetica Neue, Helvetica, Arial, sans-serif'
    ChartJS.plugins.register({
        beforeInit: function (chart) {
            chart.legend.afterFit = function () { this.height += 35 }
        },
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = '#2F3136';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    })
}

const lineRenderer = new CanvasRenderService(1200, 600, setup)
async function graph(message, command) {
    let graphData
    if (["all", "global"].includes(command))
        graphData = { timeline: await covid.historical.all({ days: -1 }) }
    else
        graphData = await covid.historical.countries({ country: command, days: -1 })
    if (graphData.message)
        return message.channel.send("("+command+") "+graphData.message + "\nYou can try ISO code.");

    const activeCases = Object.keys(graphData.timeline.cases).map(value => graphData.timeline.cases[value] - graphData.timeline.recovered[value] - graphData.timeline.deaths[value])
    const config = {
        type: "line",
        data: {
            labels: Object.keys(graphData.timeline.cases),
            datasets: [{
                label: localize.translate("Cases"),
                data: Object.values(graphData.timeline.cases),
                backgroundColor: 'rgba(255,198,151, 0.5)',
                pointBackgroundColor: 'rgba(237, 163, 101,1)',
                pointRadius: 4,
            },
            {
                label: localize.translate("Deaths"),
                data: Object.values(graphData.timeline.deaths),
                backgroundColor: 'rgba(213, 65, 65, 0.8)',
                pointBackgroundColor: 'rgba(213, 65, 65,1)',
                pointRadius: 4,
            },
            {
                label: localize.translate("Recovered"),
                data: Object.values(graphData.timeline.recovered),
                backgroundColor: 'rgba(52, 171, 52,0.5)',
                pointBackgroundColor: 'rgba(125, 211, 125,1)',
                pointRadius: 4,
            },
            {
                label: localize.translate("Active"),
                data: activeCases,
                backgroundColor: 'rgba(99, 167, 167, 0.8)',
                pointBackgroundColor: 'rgba(99, 167, 167,1)',
                pointRadius: 4,
            }
            ]
        },
        options: {
            legend: {
                labels: { usePointStyle: true, fontSize: 25 }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontSize: 25,
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 25,
                        beginAtZero: false,
                    }
                }]
            }
        }
    }

    const image = await lineRenderer.renderToBuffer(config);

    const embedMsg = {
        color: 0x0099ff,
        author: {
            name: `COVID-19 ${(!graphData.country) ? "Global" : graphData.country} Timeline`,
            icon_url: 'https://i.imgur.com/nP4sNCes.jpg',
        },
        description: '',
        thumbnail: {
            url: "",
        },
        fields: [],
        files: [new Discord.MessageAttachment(image, 'graph.png')],
        image: { url: "attachment://graph.png" },
        footer: {
            text: `${localize.translate("$[1] for commands", "`cov help`")} || ${localize.translate("$[1] to invite your server", "`cov invite`")}
${"Türkçe için `cov setlan tr`|| `cov setlan en` for English"}`

        }
    };
    return message.channel.send({ embed:embedMsg})
}

module.exports = {
    name: 'graph',
    description: 'Graph command',
    aliases: ['g', "grafik"],
    execute(message, args) {
        if (!args.length) {
            return message.channel.send(localize.translate("You didn't provide any country name")+`, ${message.author}!`);
        } else {
            graph(message, localizeCountry(args))
        }
    },
};