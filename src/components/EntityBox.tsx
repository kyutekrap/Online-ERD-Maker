import { useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { PageModel } from '../types/Page';

export const EntityBox = ({page, onClick, selected, cursor}: {page: PageModel, onClick: Function, selected: boolean, cursor: "move" | "default"}) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'ENTITY',
        item: { id: page.page_id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const setRef = useCallback(
        (element: HTMLDivElement | null) => {
            if (cursor === 'move' && element) {
                drag(element);
            }
        },
        [cursor, drag]
    );

    return (
        <div
        ref={setRef}
        onClick={() => cursor === "default" ? onClick() : {}}
        className={`absolute w-[200px] h-[100px] flex justify-center items-center bg-gray-200 border rounded ${selected ? "border-red-500" : "border-gray-400"}`}
        style={{
            left: page?.position?.x || 0,
            top: page?.position?.y || 0,
            opacity: isDragging ? 0.5 : 1,
            cursor: cursor === "move" ? isDragging ? 'grabbing' : 'grab' : 'pointer'
        }}
        >
            {page.page_name}
        </div>
    );
};