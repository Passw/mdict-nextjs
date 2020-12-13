import React, {useState} from 'react'
import styled from '@emotion/styled'
import Head from "next/head";

const GStyle = styled.div`
    #btnLookup {
    border: none;
    height: 36px;
    font-size: 12pt;
    font-weight: bold;
    vertical-align: top;
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    padding: 0 2em;
    transition: background 400ms ease;
}

    #btnLookup:not([disabled]) {
    background-color: #1A4FDD;
    xbackground-image: none;
    color: white;
}

    #dict-title {
    position: absolute;
    top: 0;
    right: 0;
    max-width: 300px;
    font-size: 10px;
    opacity: 0.9;
}

    #dict-title * {
    font-size: 10px!important;
}

    #word + .selectize-control {
    display: inline-block;
    min-width: 18em;
}

    /*---------------------------*/

    .Xstripes {
    background-color: #1A4FDD;
    color: white;
    border-color: #33D;
    -webkit-background-size: 30px 30px;
    -moz-background-size: 30px 30px;
    background-size: 30px 30px;
    background-image: -webkit-gradient(linear, left top, right bottom,
    color-stop(.25, rgba(255, 255, 255, 0.34)), color-stop(.25, transparent),
    color-stop(.5, transparent), color-stop(.5, rgba(255, 255, 255, .34)),
    color-stop(.75, rgba(255, 255, 255, 0.34)), color-stop(.75, transparent),
    to(transparent));
    background-image: -webkit-linear-gradient(135deg, rgba(255, 255, 255, 0.34) 25%, transparent 25%,
    transparent 50%, rgba(255, 255, 255, 0.34) 50%, rgba(255, 255, 255, 0.34) 75%,
    transparent 75%, transparent);
    background-image: -moz-linear-gradient(135deg, rgba(255, 255, 255, 0.34) 25%, transparent 25%,
    transparent 50%, rgba(255, 255, 255, 0.34) 50%, rgba(255, 255, 255, 0.34) 75%,
    transparent 75%, transparent);
    background-image: -ms-linear-gradient(135deg, rgba(255, 255, 255, 0.34) 25%, transparent 25%,
    transparent 50%, rgba(255, 255, 255, 0.34) 50%, rgba(255, 255, 255, 0.34) 75%,
    transparent 75%, transparent);
    background-image: -o-linear-gradient(135deg, rgba(255, 255, 255, 0.34) 25%, transparent 25%,
    transparent 50%, rgba(255, 255, 255, 0.34) 50%, rgba(255, 255, 255, 0.34) 75%,
    transparent 75%, transparent);
    background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.34) 25%, transparent 25%,
    transparent 50%, rgba(255, 255, 255, 0.34) 50%, rgba(255, 255, 255, .35) 75%,
    transparent 75%, transparent);

    -webkit-animation: animate-stripes 1s linear infinite;
    -moz-animation: animate-stripes 1s linear infinite;
}

    @-webkit-keyframes animate-stripes {
    0% {background-position: 0 0;} 100% {background-position: 60px 0;}
}


    @-moz-keyframes animate-stripes {
    0% {background-position: 0 0;} 100% {background-position: 60px 0;}
}
`

const Page = () => {
    const [word, setWord] = useState("pa")

    const onUpload = (e) => {
        e.preventDefault();
        const body = new FormData();
        for (const f of e.target.files) {
            body.append('file', f)
        }
        fetch("/api/upload", {
            method: "POST",
            body
        })
    }

    return <>
        <Head>
            <title>MDict</title>
        </Head>
        <GStyle>
            Choose a dictionary file (*.mdx + optional *.mdd):
            <input id="dictfile" type="file" multiple onChange={e => onUpload(e)}/>
            <div>
                <input id="word" type="text" value={word} onChange={e => setWord(e.target.value)}/>
                <input id="btnLookup" type="button" value="look up"/>
                <div style={{color: "#888", fontSize: "12px", fontStyle: "italic"}}>
                    You can apply wildcard in query text to narrow down word list of candidates:
                    <ul style={{color: "#888", fontSize: "12px", fontStyle: "italic"}}>
                        <li>"*" for 0 or more characters, "?" for just 1 character</li>
                        <li>Append whitespace to end of query text to include space saperated phrase.</li>
                    </ul>
                </div>

                <div id="dict-title"/>
                <div id="definition"/>
            </div>
        </GStyle>
    </>

}

export default Page


