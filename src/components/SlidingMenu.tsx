import { useState } from 'react';
import { PageModel } from '../types/Page';
import { IconButton } from '../common/IconButton';

const SlidingMenu = ({
    pages,
    setPages
}: {
    pages: PageModel[],
    setPages: Function
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState(0);
    const [search, setSearch] = useState("");

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    function filterSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value);
    }

    function focusEntity(p: PageModel) {
        if (p.position === undefined) {
            setPages((prevPages: PageModel[]) => 
                prevPages.map((page: PageModel) => 
                    page.page_id === p.page_id ? { ...page, position: 
                        { x: window.innerWidth / 2, y: window.innerHeight / 2 }
                    } : page
                )
            );
        }
    }

    function createNew() {
        setPages([{
            page_id: search,
            page_name: search,
            module: "custom"
        }, ...pages]);
    }

    return (
        <div className="relative">
            <div className='absolute top-2 left-2 z-40'>
                <IconButton onClick={() => toggleMenu()}>
                    <img src="/icons/menu.svg" height="20px" width="20px" />
                </IconButton>
            </div>
            <nav className={`z-40 fixed top-0 left-0 h-full bg-black text-white transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} min-w-[250px] w-full sm:w-auto`}>
                <div className='m-2'>
                    <IconButton onClick={() => toggleMenu()}>
                        <img src="/icons/arrow-left.svg" width={20} height={20} className='invert' />
                    </IconButton>
                </div>
                <div className='px-4 space-y-4'>
                    <h1 className='text-lg font-bold'>Untitled</h1>
                    <div className='flex flex-row items-center space-x-1'>
                        <a className='cursor-pointer hover:underline' onClick={() => setView(0)}>Basic</a>
                        <a>/</a>
                        <a className='cursor-pointer hover:underline' onClick={() => setView(1)}>Properties</a>
                    </div>
                </div>
                {view === 0 ? (
                    <ul className="space-y-4 p-4">
                        <li>
                            <div className='flex flex-col'>
                                <label>Name</label>
                                <input className='p-1 rounded' />
                            </div>
                        </li>
                        <li>
                            <div className='flex flex-col'>
                                <label>Description</label>
                                <textarea className='p-1 rounded'></textarea>
                            </div>
                        </li>
                        <li>
                            <button className='w-full p-1 text-center rounded bg-blue-600'>
                                Publish
                            </button>
                        </li>
                    </ul>
                ) : (
                    <ul className='overflow-y-auto'>
                        <li>
                            <div className='p-4'>
                                <div className='flex flex-col'>
                                    <label>Filter</label>
                                    <input className='p-1 rounded text-black' placeholder='Search' value={search} onChange={filterSearch} />
                                </div>
                            </div>
                        </li>
                        <li className="flex flex-row justify-between items-center py-2 px-4 bg-gray-800">
                            <div><label>Custom</label></div>
                            <div><label>{pages.filter(p => p.module !== 'basic' && p.page_name.includes(search)).length}</label></div>
                        </li>
                        <ul>
                            {
                                pages.filter(p => p.module !== 'basic' && p.page_name.includes(search)).map((p: PageModel, i: number) => (
                                    <li key={i} className='px-4 py-2 cursor-pointer' onClick={() => focusEntity(p)}>
                                        <span>{p.page_name}</span>
                                    </li>
                                ))
                            }
                        </ul>
                        <li className="flex flex-row justify-between items-center py-2 px-4 bg-gray-800">
                            <div><label>Basic</label></div>
                            <div><label>{pages.filter(p => p.module === 'basic' && p.page_name.includes(search)).length}</label></div>
                        </li>
                        <ul>
                            {
                                pages.filter(p => p.module === 'basic' && p.page_name.includes(search)).map((p: PageModel, i: number) => (
                                    <li key={i} className='px-4 py-2 cursor-pointer' onClick={() => focusEntity(p)}>
                                        <a className={`${p.position !== undefined ? "text-background" : "text-gray-500"}`}>
                                            <label>{p.page_name}</label>
                                        </a>
                                    </li>
                                ))
                            }
                        </ul>
                        {
                            pages.filter(p => p.page_name.includes(search)).length === 0 && (
                                <li className='text-center mt-2'>
                                    <a className='cursor-pointer hover:underline' onClick={() => createNew()}>Create New</a>
                                </li>
                            )
                        }
                    </ul>
                )}
            </nav>
        </div>
    );
};

export default SlidingMenu;