

import { Box, Button, IconButton, TextField, Typography, useTheme } from "@mui/material"
import { useEffect, useState } from "react"
import { tokens } from "../../theme";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternate"
import Header from "../../components/Header";
import { child, get, getDatabase, ref, remove, set } from "firebase/database";
import app from "../../firebase/config";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Cards from "../../components/Card";
import { getDownloadURL, getStorage, uploadBytesResumable, ref as storageRef, deleteObject } from "firebase/storage";
import currentDate from "../../utils/date";
import ShowAlert from "../../components/ShowAlert";
import pdfImg from "../../images/pdf.png"




const db = getDatabase(app);
const storage = getStorage(app);

const Document = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [documentName, setDocumentName] = useState("")
    const [userUid, setuserUid] = useState("")
    // console.log("userUid", userUid);
    const [userDoc, setUserDoc] = useState([])
    // console.log(userDoc.length);
    const [select, setSelect] = useState(1);
    const [event, setEvent] = useState(1);
    // console.log("Now event is ", event);
    const storageForImg = getStorage(app);
    const [img, setImg] = useState();
    const storageRefForImage = storageRef(storageForImg, `Document/${userUid}`)
    const [percent, setPercent] = useState(0);

    const [openAlert, setOpenAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")
    // console.log("alertMessage", alertMessage);

    const tempUid = () => {
        const dbRef = ref(db);
        get(child(dbRef, `temp/`))
            .then((snapshot) => {
                const data = snapshot.val();
                if (snapshot.exists()) {
                    // console.log("uid", data)
                    setuserUid(data)
                } else {
                    console.log("No data available");
                }
            })
            .catch((error) => {
                console.error(error);
            });


    }
    tempUid()
    const handleUploadPdf = (e) => {
        e.preventDefault()
        if (!img) {

            setOpenAlert(true)
            setAlertMessage("Select your image first")
        } else {
            const uploadImg = uploadBytesResumable(storageRefForImage, img);
            uploadImg.on("state_changed", (snapshot) => {
                const percent = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100);

                // update progress

                setOpenAlert(true)
                setAlertMessage(`Document Uploaded ${percent} % !!!!`)
            },
                (err) => alert(err.message),
                () => {
                    getDownloadURL(uploadImg.snapshot.ref).then((url) => {
                        console.log(url)
                        const uid = new Date().getTime();
                        set(ref(db, `/Docu/${userUid.uid}/${uid}`), {
                            date: currentDate,
                            url,
                            id: `${uid}`,
                            name: documentName,
                            seen: false,
                            type: "pdf",
                            uid: `${userUid.uid}`,
                            who: true
                        }).then(() => {
                            setOpenAlert(true)
                            setAlertMessage("Document Send  SuccessFully")
                            setPercent(0)
                            setImg("")
                            setDocumentName("")
                        })
                    })
                }
            )
        }
    }

    const getSendData = () => {
        const dbRef = ref(db);
        get(child(dbRef, `/Docu/${userUid.uid}/`))
            .then((snapshot) => {
                const data = snapshot.val();
                setUserDoc([])
                if (snapshot.exists()) {
                    // console.log(data);
                    Object.values(data).map((userDocs) => {
                        // console.log("who", userDocs.who);
                        if (userDocs.who === true) {
                            return setUserDoc((oldDoc) => [...oldDoc, userDocs])
                        }
                        // console.log("user doc is ...........", userDocs)
                    })
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }


    const getReceveData = () => {
        const dbRef = ref(db);
        get(child(dbRef, `/Docu/${userUid.uid}/`))
            .then((snapshot) => {
                const data = snapshot.val();
                setUserDoc([])
                if (snapshot.exists()) {
                    // console.log(data);
                    Object.values(data).map((userDocs) => {
                        console.log("who", userDocs.who);
                        if (userDocs.who === false) {
                            return setUserDoc((oldDoc) => [...oldDoc, userDocs])
                        }
                        // console.log("user doc is ...........", userDocs)
                    })

                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const handleChangeText = (event) => {
        setSelect(event.target.value);
        setEvent(event.target.value)

    }
    const handleChangePdf = (e) => {
        setImg(e.target.files[0])
    }


    if (event === 1 || event === 2) {
        getSendData()
    }
    if (event === 3) {
        getReceveData()
    }


    const deletePdf = (index, url, uid, id) => {

        // console.log(index,url,uid,id);
        deleteObject(storageRef(storage, `${url}`));

        remove(ref(db, `Docu/${uid}/${id}`))
            .then(() => {
                setOpenAlert(true)
                setAlertMessage("Pdf has been deleted")
            }).catch((err) => {

                setOpenAlert(true)
                setAlertMessage(`Pdf has been not deleted ${err.message}`);
                console.log("Error message", err.message)
            });
    }

    return (
        <Box m="20px" >
            <Header title="Documents" subtitle="User document" />
            <ShowAlert
                sx={{ display: "none" }}
                message={alertMessage}
                show={openAlert}
                hide={() => { setOpenAlert(false) }}
            />
            <Box m="20px" sx={{ display: "flex", width: "100%" }} >
                <IconButton color="primary" aria-label="upload picture" component="label">
                    <input onChange={handleChangePdf} hidden accept=".pdf" type="file" />
                    <AddPhotoAlternateOutlinedIcon
                        sx={{
                            color: colors.greenAccent[400],
                            fontSize: "60px",
                            marginRight: "30px"
                        }} />
                </IconButton>
                <form onSubmit={handleUploadPdf} style={{ display: "flex" }} >
                    <TextField
                        id="standard-textarea"
                        label="Document Title"
                        placeholder="Enter Your Document Title"
                        multiline
                        variant="standard"

                        onChange={(e) => setDocumentName(e.target.value)}
                        value={documentName}
                        name="documentName"
                        sx={{ width: "250px", marginTop: "5px" }}

                    />
                    <Box display="flex" justifyContent="center" ml="20px" mt="20px" mb="10px">
                        <Button disabled={documentName === ""} type="submit" color="secondary" variant="outlined">
                            Add Document
                        </Button>

                    </Box>
                </form>
                <div>
                    <FormControl sx={{ margin: "12px 20px", minWidth: 80 }}>
                        <InputLabel id="demo-simple-select-autowidth-label">Document</InputLabel>
                        <Select
                            labelId="demo-simple-select-autowidth-label"
                            id="demo-simple-select-autowidth"
                            value={select}
                            onChange={handleChangeText}
                            autoWidth
                            label="Documents"
                        >
                            <MenuItem value={1}>All </MenuItem>
                            <MenuItem value={2}>Send</MenuItem>
                            <MenuItem value={3}>Receved</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </Box>
            {
                (userDoc.length === 0)
                    ?
                    <Typography variant="h3" >Yet , Not Any Documents!!!</Typography>
                    :

                    <Box sx={{ display: "flex", gap: "30px", flexWrap: "wrap" }} >
                        {
                            userDoc.map((doc, index) => {
                                // console.log("allUserDoc",doc)
                                return (
                                    <Cards
                                        key={index}
                                        img={pdfImg}
                                        header={doc.name}
                                        date={doc.date}
                                        deleteItem={() => { deletePdf(index, doc.url, doc.uid, doc.id) }}
                                    />
                                );
                            })
                        }
                    </Box>
            }
        </Box>
    )
}


export default Document