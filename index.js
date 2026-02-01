const fs = require('fs')
const path = require('path')
const readline = require('readline')
//const progress = (c, t) => process.stdout.write(`\r[${'█'.repeat(c/t*20|0)}${' '.repeat(20-c/t*20|0)}] ${(c/t*100).toFixed(2)}%`);
const progress = (current, total) => {
    const percent = Math.round(current/total*100)
    process.stdout.write(`\rProgress: [${'='.repeat(percent/2)}${' '.repeat(50-percent/2)}] ${percent}%`)
}
fs.readdirSync('csv')
.filter(fn => fn == '78_Snapshot.csv')
.map(fn => path.join('csv', fn))
.forEach(fn => {
    let isHeader = true;
    const rl = readline.createInterface({input: fs.createReadStream(fn), crlfDelay: Infinity})
    const messages = {}
    var line_number = -1
    var buffer = Buffer.from('', 'hex')
    console.log('Filename:', fn)
    rl.on('line', line => {
        line_number++
        if (line_number == 0) return 
        const hex = line.split(',')[5]
        console.log(hex)
        if (hex) buffer = Buffer.concat([buffer, Buffer.from(hex, 'hex')])
    })
    rl.on('close', () => {
        console.log(fn, 'buffer size', buffer.length)
        var i = 0
        while (i + 10 < buffer.length) {
            const MsgSeqNum = buffer.readUInt32BE(i + 0);console.log('MsgSeqNum:', MsgSeqNum)
            const NoChunks = buffer.readUInt16BE(i + 4);console.log('NoChunks:', NoChunks)
            const CurrentChunk = buffer.readUInt16BE(i + 6);console.log('CurrentChunk:', CurrentChunk)
            const MsgLength = buffer.readUInt16BE(i + 8);console.log('MsgLength:', MsgLength)
            
            messages[MsgSeqNum] ??= []
            
            if (messages[MsgSeqNum][CurrentChunk]) {
                if (messages[MsgSeqNum][CurrentChunk].length < MsgLength) {
                    messages[MsgSeqNum][CurrentChunk] += buffer.slice(i + 10, i + 10 + MsgLength)
                    
                    if (messages[MsgSeqNum][CurrentChunk].length > MsgLength) {
                        //console.log(MsgSeqNum, CurrentChunk, 'chunk is bigger and cutted')
                        messages[MsgSeqNum][CurrentChunk] = messages[MsgSeqNum][CurrentChunk].slice(i + 10, i + 10 + MsgLength)    
                    }
                    
                    if (messages[MsgSeqNum][CurrentChunk].length == MsgLength) {
                        console.log(MsgSeqNum, CurrentChunk, 'got chunk!')
                    }
                } else {
                    //console.warn('Extra data for', MsgSeqNum, CurrentChunk)
                }
                
            } else {
                messages[MsgSeqNum][CurrentChunk] = buffer.slice(i + 10, i + 10 + MsgLength)
            }
            
            i += 10 + MsgLength
        }
        
        const messages_num = Object.keys(messages)
        
        messages_num.forEach(mn => {
            const chunks = messages[mn]
            console.log(mn, 'have chunks:', chunks.length)
            /*
            const missing = Array.from(chunks).slice(1).some(c => !c);
            
            if (missing) {
                console.error(`[ERROR] MsgSeqNum: ${mn} - Missing chunks! Cannot reassemble safely.`)
                return
                }
                
                // Slice starting from 1 to ignore the empty 0th element
            const validChunks = chunks.slice(1) 
            const totalLength = validChunks.reduce((acc, c) => acc + c.length, 0)
            const reassembled = Buffer.concat(validChunks)
            
            console.log(`MsgSeqNum: ${mn}`)
            console.log(`  Chunks collected: ${validChunks.length}`)
            console.log(`  Reassembled length: ${totalLength} bytes`)
            console.log(`  First 20 bytes: ${reassembled.subarray(0, 20).toString('hex')}`)
            console.log()
            */
        })
    })
})
