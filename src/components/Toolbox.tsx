import { IconButton } from "../common/IconButton";

const Toolbox = ({ setCursor }: { setCursor: Function }) => (
    <div className="fixed bottom-3 left-0 right-0 flex justify-center z-40">
        <div className="flex flex-row items-center space-x-1 rounded-lg bg-[rgba(0,0,0,0.2)] py-1 px-3">
            <IconButton onClick={() => setCursor("default")}>
                <img src="/icons/cursor-default.svg" height="15px" width="15px" />
            </IconButton>
            <IconButton onClick={() => setCursor("move")}>
                <img src="/icons/cursor-move.svg" height="15px" width="15px" />
            </IconButton>
        </div>
    </div>
);

export default Toolbox;