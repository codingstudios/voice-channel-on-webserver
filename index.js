
const { joinVoiceChannel } = require('@discordjs/voice');
const { Client, Intents } = require("discord.js");
const config = require('./config.json');
const express = require('express');
const app = express();
const helmet = require('helmet');
const prism = require('prism-media');
const { pipeline } = require('node:stream');

app.use(helmet());
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

app.get(`/`, async (req,res) => {
try {
 const channel = await client.channels.cache.get(`${config.voiceChannelID}`);
 const connection = await joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false
});
const opusStream = await connection.receiver.subscribe(`${config.audioID}`);
const oggStream = new prism.opus.OggLogicalBitstream({
    opusHead: new prism.opus.OpusHead({
        channelCount: 2,
        sampleRate: 48000,
    }),
    pageSizeControl: {
        maxPackets: 10,
    },
});
pipeline(opusStream, oggStream, res, (err) => console.log(err));
}catch(err) {
    res.send('Error');
    console.log(err)
}
});

client.login(config.token);
app.listen(config.PORT || process.env.PORT);
