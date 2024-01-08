import React, { useState, useEffect, useRef } from 'react'
import spinner from '../assets/spinner.svg'
import usePhotos from '../hooks/usePhotos'


function List() {
  const [query, setQuery] = useState("random")
  const [pageNumber, setPageNumber] = useState(1)
  const lastPicRef = useRef()
  const searchRef = useRef()
  const photosApiData = usePhotos(query, pageNumber)

  // fonction callback pour observer s'il y a une dernière image et actualise useRef sinon se stop.
  useEffect(() => {
    if(lastPicRef.current) {
      const observer = new IntersectionObserver(([entry]) => {
        if(entry.isIntersecting && photosApiData.maxPages !== pageNumber) {
          setPageNumber(pageNumber +1)
          lastPicRef.current = null
          observer.disconnect()
        }
      })
      observer.observe(lastPicRef.current)
    }
  }, [photosApiData])

  function handleSubmit(e){
    e.preventDefault()
    if(searchRef.current.value !== query) {
      setQuery(searchRef.current.value)
      setPageNumber(1)
    }
  }
  
  return (
    <>
      <h1 className='text-4xl'>Unsplash Clone.</h1>
      <form onSubmit={handleSubmit}>
        <label className='block mb-4' htmlFor="search">Rechercher une image...</label>
        <input
          ref={searchRef}
          type="text"
          placeholder='Rechercher quelque chose...'
          className='w-full px-2 py-3 border rounded bloc mb-14 text-slate-800 text-md outline-gray-500 border-slate-400'
        />
      </form>
      {/* Affichage erreur */}
        {photosApiData.error.state && <p>{photosApiData.error.msg}</p>}

      {/* Pas d'erreur mais pas de résultat */}
        {photosApiData.photos.length === 0 && 
          !photosApiData.error.state && 
          !photosApiData.loading && 
          <p>"Pas d'image correspondant à la recherche"</p>
        }
      
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,_1fr))] auto-rows-[175px] gap-4 justify-center">
        {!photosApiData.loader && photosApiData.photos.length !== 0 && photosApiData.photos.map((photo, index) => {
          if(photosApiData.photos.length === index + 1) { // vérifie si on est à la dernière image 
            return (
              <li 
                ref={lastPicRef} // dernière image
                key={photo.id}
              >
                <img 
                  className='object-cover w-full h-full'
                  src={photo.urls.regular} alt={photo.alt_description} />
              </li>
            )
          } else {
            return (
              <li key={photo.id}>
                <img 
                  className='object-cover w-full h-full'
                src={photo.urls.regular} alt={photo.alt_description} />
              </li>
            )
          }
        })}
      </ul>
      {/*  Loader  */}
        {(photosApiData.loading && !photosApiData.error.state) && 
        <img className='block mx-auto' src={spinner} />}

      {/* Quand on atteint la dernière page */}
        {photosApiData.maxPages === pageNumber && <p className='mt-10'>Il n'y a plus de photo correspondant à votre recherche.</p>}
    </>
  )
}

export default List