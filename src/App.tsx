import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SlidingMenu from "./components/SlidingMenu";
import Grid from "./components/Grid";
import Toolbox from "./components/Toolbox";
import { PageModel } from "./types/Page";

const App = () => {
    const [pages, setPages] = useState<PageModel[]>([]);
    const [cursor, setCursor] = useState<"move" | "default">("move");

    useEffect(() => {
        setPages([
            {
                page_id: "1",
                module: "basic",
                page_name: "Component 1"
            },
            {
                page_id: "2",
                module: "basic",
                page_name: "Component 2"
            }
        ])
    }, []);
    
    return (
        <div>
            <SlidingMenu pages={pages} setPages={setPages} />
            <DndProvider backend={HTML5Backend}>
                <Grid pages={pages} setPages={setPages} cursor={cursor} />
            </DndProvider>
            <Toolbox setCursor={setCursor} />
        </div>
    );
};

export default App;