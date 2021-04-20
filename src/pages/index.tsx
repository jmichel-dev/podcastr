export default function Home(props) {
  console.log(props)
  return (
    <h1>index</h1>
  )
}

// SSR - Server side rendering
// export async function getServerSideProps() {
//   const response = await fetch('http://localhost:3333/episodes')
//   const data = await response.json()

//   return {
//     props: {
//       episodes: data,
//     }
//   };
// }

// SSG - Static Site generator
export async function getStaticProps() {
  const response = await fetch('http://localhost:3333/episodes')
  const data = await response.json()

  return {
    props: {
      episodes: data,
    },
    revalidate: 60 * 60 * 8, // 8 horas
  };
}
