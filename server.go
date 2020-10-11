// Have fun learning go!
package main

import (
    "log"
    "net/http"
    "sync"
    "os"
    "fmt"
    "strconv"

    "github.com/gorilla/websocket"
)

var addr = "localhost:8080"
var upgrader = websocket.Upgrader{ CheckOrigin: func (r *http.Request) bool { return true; }}

type Player struct {
    x, y int
    name string
}

func (p Player) String() string {
    return fmt.Sprintf("{ \"name\": %q, \"x\": %v, \"y\": %v }", p.name, p.x, p.y)
}

var (
    inc = 0
    players = make(map[int]*Player)
    mux sync.Mutex
)

func joinGame(c *websocket.Conn) (int, bool) {
    mux.Lock()
    defer mux.Unlock()

    inc += 1
    _, name, err := c.ReadMessage()
    if err != nil {
        log.Println("error:", err)
        return 0, false
    }
    _, xb, err := c.ReadMessage()
    x, _ := strconv.Atoi(string(xb))
    if err != nil {
        log.Println("error:", err)
        return 0, false
    }
    _, yb, err := c.ReadMessage()
    y, _ := strconv.Atoi(string(yb))
    if err != nil {
        log.Println("error:", err)
        return 0, false
    }

    players[inc] = &Player{ name: string(name), x: x, y: y }
    log.Printf("A new player (%v) has joined!\n", string(name))
    return inc, true
}

// Put players[id] first. Hacky way of working out which player you control.
// Needs fixing...
// Also, should probably just find something to help convert to JSON
func serialisePlayers(id int) []byte {
    var result string = players[id].String()
    for i, v := range players {
        if i != id {
            result += ","
            result = result + v.String()
        }
    }
    return []byte("[" + result + "]")
}

func gameServer(w http.ResponseWriter, r *http.Request) {
    c, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Print("upgrade:", err)
        return
    }
    defer c.Close()

    id, ok := joinGame(c)

    defer func () {
        mux.Lock()
        log.Printf("A player (%v) has left.\n", players[id].name)
        delete(players, id)
        mux.Unlock()
    }()

    if !ok { // Game server full
        return
    }

    for {
        // Read x, y from client
        mt, xb, err := c.ReadMessage()
        x, _ := strconv.Atoi(string(xb))
        if err != nil {
            log.Println("error:", err)
            break
        }
        _, yb, err := c.ReadMessage()
        y, _ := strconv.Atoi(string(yb))
        if err != nil {
            log.Println("error:", err)
            break
        }

        players[id].x = x
        players[id].y = y

        // Send all player positions to client
        err = c.WriteMessage(mt, serialisePlayers(id))
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
    log.Println("Starting server on", addr)
    http.ListenAndServe(addr, nil)
}
