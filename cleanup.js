const { exec } = require('child_process');

function removeDir(){
    return new Promise((resolve,reject)=>{
        exec('rm -rf hello',(err)=>{
            if (err) reject();
            else resolve();
        });
    })
}

async function run(){
    await removeDir();
    console.log('Done cleanup');
}

run();

