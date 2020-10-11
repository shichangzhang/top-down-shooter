// Have fun learning go!
package main

import (
    "log"
    "net/http"
    "os"

    "github.com/gorilla/websocket"
)

var addr = "localhost:8080"
var upgrader = websocket.Upgrader{ CheckOrigin: func (r *http.Request) bool { return true; }}

func gameServer(w http.ResponseWriter, r *http.Request) {
    c, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Print("upgrade:", err)
        return
    }
    defer c.Close()
    for {
        mt, message, err := c.ReadMessage()
        if err != nil {
            log.Println("read:", err)
            break
        }
        log.Printf("recv: %s", message)
        err = c.WriteMessage(mt, message)
        if err != nil {
            log.Println("write:", err)
            break
        }
    }
}

func main() {
    if os.Getenv("PORT") != "" {
        addr = ":" + os.Getenv("PORT")
    }
    http.HandleFunc("/", gameServer)
    http.ListenAndServe(addr, nil)
}
