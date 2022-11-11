import axios from "axios";
import got from "got";
import HttpsProxyAgent from "https-proxy-agent";
var agent = HttpsProxyAgent(process.env.LOCAL_HTTP_PROXY ?? "");



function createGotClient() {
    if (!process.env.LOCAL_HTTP_PROXY) {
        return got.extend({
            responseType: "json",
            resolveBodyOnly: true,
        });
    }
    return got.extend({
        responseType: "json",
        resolveBodyOnly: true,
        agent: {
            http: agent,
            https: agent,
        },
    });
}

export const gotClient = createGotClient();



export function createAxiosClient() {
    if (!process.env.LOCAL_HTTP_PROXY) {
        return axios.create()
    }
    return axios.create({
        httpAgent: agent,
        httpsAgent: agent
    })

}

export const $axios = createAxiosClient()
