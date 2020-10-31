require('dotenv').config()

const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Discord.Client({ disableEveryone: true });
const PREFIX = '>';

const queue =  new Map()


client.on('ready', () => { 
    console.log(`Ulogovan kao: ${client.user.tag}!`);
    client.user.setActivity('Harmonika ', { type: 'PLAYING' });
      });

client.on('message', async message =>{
    if(message.author.bot) return
    if(!message.content.startsWith(PREFIX)) return
    console.log(`${message.author.tag}: ${message.content}`);

    const args = message.content.substring(PREFIX.length).split(" ")
    const serverQueue = queue.get(message.guild.id)

    if(message.content.startsWith(`${PREFIX}play`)){
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send("Moras u voicu da budes")
        
        
        const songInfo = await ytdl.getInfo(args[1])
        const song = {
            title: songInfo.title,
            url: songInfo.video_url
        }
        
        
        
        if(!serverQueue){
            const queueConstruct ={
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                playing: true
            }
            queue.set(message.guild.id, queueConstruct)

            queueConstruct.songs.push(song)
        
            try{
                var connection = await voiceChannel.join()
                queueConstruct.connection = connection
                play(message.guild, queueConstruct.songs[0])
            } catch (error){
                console.log(`error neki ${error}`)
                queue.delete(message.guild.id)
                return message.channel.send(`neka greska ${error}`)
            }
        
        }else{
            serverQueue.songs.push(song)
            return message.channel.send(`**${song.title}** je dodato na listu`)
        }
       return undefined



        
    } else if (message.content.startsWith(`${PREFIX}stop`)){
        if(!message.member.voice.channel) return message.channel.send("moras da budes u voicu")
       if(!serverQueue) return message.channel.send('nista nisi pustio')
       serverQueue.songs = []
       serverQueue.connection.dispatcher.end()
       message.channel.send("Muzika je zaustavljena")
        return undefined
        
    }else if (message.content.startsWith(`${PREFIX}skip`)){
        if(!message.member.voice.channel) return message.channel.send('Moras da budes u voicu')
    if(!serverQueue) return message.channel.send('Nista se ne pusta')
    serverQueue.connection.dispatcher.end()
    message.channel.send('Preskocio sam tu pesmu')
    return undefined
    }
})


function play(guild,song) {
 const serverQueue = queue.get(guild.id)

 if(!song){
     serverQueue.voiceChannel.leave()
     queue.delete(guild.id)
     return
 }

 const dispatcher = serverQueue.connection.play(ytdl(song.url))
 .on('finish', () => {
    serverQueue.songs.shift()
    play(guild, serverQueue.songs[0])
 })
 .on('error', error =>{
     console.log(error)
 })
 dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)

}


client.login('xd no token for you')
