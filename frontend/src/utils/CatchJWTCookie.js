/** 
 * Looks in the browser's cookies for one named JWT.
 * 
 * @returns If this cookie is found, it returns its value.
 *          Otherwise, it returns null.
 */
const catchJWTCookie = (cookies) => {
    const regex = /JWT=.*;*/g
    const found = cookies.match(regex);

    return (found ? found[0].replace(/JWT=|;/g,'') : null)
}

export default catchJWTCookie;