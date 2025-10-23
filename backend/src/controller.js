const generateContent = require('./ai.js')

const  aiController = async (req,res)=>{
    const code = req.body.code

    if(!code)
    {
        res.status(400).json({message:"No Prompt found: Please Enter the code to be Reviewed"})
    }

    const response = await generateContent(code)
    res.send(response)
}

module.exports = aiController