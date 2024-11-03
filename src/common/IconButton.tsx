export const IconButton = ({
    children,
    onClick
}: {
    children: React.ReactNode,
    onClick: () => void
}) => (
    <div className="rounded-full w-10 h-10 hover:bg-gray-50 flex justify-center items-center cursor-pointer" onClick={onClick}>
        {children}
    </div>
)