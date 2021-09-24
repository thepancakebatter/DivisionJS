import {readFileSync, PathOrFileDescriptor, writeFileSync} from "fs"
import {Attributes} from "./interfaces/Attributes";
import * as fs from "fs";
import { v4 as uuidv4 } from 'uuid';
/*
* <div id="" className="attribute">----------</div>
* */

export class Division{
    private readonly tag: string;
    private id: string;
    private attributes: Attributes;
    private class: string;
    private styles: any;

    private idStyleName: string;

    private classStyleName: string;
    private innerText: string;
    private inputType: string;
    private inputCount: number;
    private buttonFunction: string;
    private margin: string;
    private basicTagNames: Array<string>;
    private myData: {
        type: any;
    } | undefined
    private vModel: any;
    static createDom(tag:string,attributes:Attributes,styles:any):Division{
        return new Division(tag,attributes,styles)
    }
    static div(attributes:Attributes,styles:any):Division{
        return new Division("div",attributes,styles)
    }
    // static img():Division{
    //     return new Division('img')
    // }
    // static span():Division{
    //     return new Division('span')
    // }
    // static p():Division{
    //     return new Division('p')
    // }
    // static h1():Division{
    //     return new Division("h1")
    // }
    // static h2():Division{
    //     return new Division("h2")
    // }
    // static h3():Division{
    //     return new Division("h3")
    // }
    // static h4():Division{
    //     return new Division("h4")
    // }
    // static h5():Division{
    //     return new Division("h5")
    // }
    // static h6():Division{
    //     return new Division("h6")
    // }
    // static input():Division{
    //     return new Division('input')
    // }
    // static button():Division{
    //     return new Division('button')
    // }
    // static select():Division{
    //     return new Division('select')
    // }
    // static tagName = function () {
    //     return new Division(`${Division.tagName.name}`)
    // }
    // static form():Division{
    //     return new Division('form')
    // }
    constructor(tag:string, attributes:Attributes, styles:any ) {
        console.log(`Constructing tag : ${tag}`)
        this.tag = tag
        this.attributes = attributes
        this.id = attributes.id || uuidv4().split("-")[0]
        this.class = attributes.class
        this.innerText = attributes.innerText || ''
        this.styles = styles || {}

        this.idStyleName = ''
        this.classStyleName = ''
        this.inputType = ''
        this.inputCount = 0
        this.buttonFunction = ''
        this.margin = ''
        this.basicTagNames = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        // this.dataId = uuidv4()
        this.vModel = ''
    }
    setIdName(idname:string) {
        this.id = idname
        this.idStyleName = idname
        return this
    }
    setClassName(classname:string){
        this.class = classname
        this.classStyleName = classname
        return this
    }
    setInnerText(text:string){
        this.innerText = text
        return this
    }
    setData(data:any){
        this.myData = data
        return this
    }
    setInput(inputtype:string) {
        this.inputType = `type="${inputtype}"`
        if (inputtype === 'button') {
            this.buttonFunction = "@click='myInputFunction()' "
        }
        return this
    }
    setInputCount(inputCount:number) {
        this.inputCount = inputCount
        return this
    }
    setMargin() {
        this.margin = 'margin: auto'
        return this
    }
    generateHTML(){
        return `<${this.tag} id=${this.id} ${(this.class && `class="${this.class}"`) || ''}>${this.innerText}</${this.tag}>\n`
        // if (this.tag === 'form') {
        //     return `<${this.tag}>\n ${this.generateMultipleInput()} </${this.tag}>\n`
        // }
        // if (this.tag === 'input') {
        //     return `<${this.tag} ${this.inputType} ${this.buttonFunction}/>\n`
        // }
        // if (this.tag === 'button') {
        //     return `<${this.tag} @click="myButtonFunction()"></${this.tag}>\n`
        // }
        // if (this.tag === 'select') {
        //     return `<${this.tag}>\n<option></option>\n</${this.tag}>\n`
        // }
        // if (this.tag === 'img') {
        //     return `<${this.tag} src="" alt="" />\n`
        // }
        // if (this.basicTagNames.includes(this.tag)) {
        //     return `<${this.tag}></${this.tag}>\n`
        // }

    }
    generateStyle() {
        //tag#id.class
        const cssSelector = `${this.tag}#${this.id}${(this.class && '.' + this.class.split(" ").join(".")) || ''}`
        const css = Object.keys(this.styles).reduce((accumulator,cssKey)=>accumulator+`${cssKey}:${this.styles[cssKey]};`,'')
        return `${cssSelector}{\n${css}\n}\n`

    }
    generateScripts() {
        if (this.inputType === `type="button"`) {
            return `myInputFunction(){},\n`
        }
        if (this.tag === 'button') {
            return `myButtonFunction(){},\n`
        }
    }
    generateData() {
        if (this.myData) {
            return `${this.myData}: ,`
        }
    }
    generateMultipleInput() {
        let i = 0;
        let input = '<label>\n<input v-model="" />\n</label>\n'
        let myInputs = ''
        for(i; i<this.inputCount; i++) {
            myInputs += input
        }
        return myInputs
    }
    static compile(divisionFilePath:PathOrFileDescriptor):string{
        const raw = readFileSync(divisionFilePath,{encoding:"utf-8"})
        console.log(raw)
        const matchedDivision = raw.match(/Division.\w+\(([\x00-\x7F]+?)?\)[\s]+/gm)
        console.log(matchedDivision)
        if(matchedDivision){
            const compiledJS = `
        const {Division} = require("../build/index")
        const fs = require("fs")
        const x  = [
            ${matchedDivision.join(",")}
        ]
        <template>
            <div>
                \${x.map(s=>s.generateHTML()).join('')}
            </div> 
        </template>
        <script>
         export default {
            name: "${String(divisionFilePath).split(/(\\|\/)/g).pop()}",
            data () {
                return {
                    \${x.map(s=>s.generateData()).join('')}
                }
            },
            methods: {
                \${x.map(s=>s.generateScripts()).join('')}
            }
         
         }
        </script>
        <style scoped>
               \${x.map(s=>s.generateStyle()).join('')}
        </style>
        \`
        fs.writeFileSync('${divisionFilePath+".vue"}',compiledVue,{encoding:"utf-8"})
        `
            writeFileSync(divisionFilePath+".compiled",compiledJS,{encoding:"utf-8"})

        } else {
            console.log(Error.name)
        }
        let divisions = `<div></div><div></div><div></div>`
        return `
        <template>
            <div>
                ${divisions} 
            </div> 
        </template>
        <script>
         
        </script>
        <style scoped>
        
        </style>
        `
    }
}
