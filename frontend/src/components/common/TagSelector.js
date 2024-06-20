import { Autocomplete, TextField, createFilterOptions } from "@mui/material";
import { useEffect, useState } from "react";
import { getAllTags } from "../../utils/fetchs/ApiFetches";
import { useGlobalAlert } from "../../hooks/useGlobalAlert";

// Filter object used by commonTagFilter
const filter = createFilterOptions();

/**
 * Filters the tag options' list. Checks if the tag is already in the options, if that's
 * the case it just shows the list, but if the tag is not in the options, it creates a new
 * option to add it to the list.
 */
const commonTagFilter = (options, params) => {
    const filtered = filter(options, params);
    const { inputValue } = params;

    const tagExists = options.some((option) => inputValue === option.tag);
    if (inputValue !== "" && !tagExists)
        filtered.push({ inputValue, tag: `Add "${inputValue}"` });

    return filtered;
};


/**
 * Generates the option label object. We usually just need an string
 * 
 * @param {*} option Option to be rendered.
 */
const defaultGetOptionLabel = (option) => {
    if (typeof option === "string") return option;
    if (option.inputValue !== undefined) return option.inputValue;
    return option.tag;
};


/**
 * Tag validator. Only allows tags consisting of 2 words and
 * less than 17 chars long.
 * 
 * @param {*} tag Tag to evaluate
 * @returns true if the tag is valid/false otherwise
 */
const isValidTag = (tag) => {
    const words = tag.split(' ');
    if (words.length > 2)
        return false;

    return words.reduceRight((acc, v) => acc + v.length, 0) <= 16;
}


/**
 * Component that allows the user to select tags from the list of
 * tags stored in the sytem.
 * 
 * @param {*} value Current tags selected. Must be an array of objetcts {tag: string}
 * @param {*} readOnly Indicates if the field is readOnly or not
 * @param {*} onChange Callback function called when the value of the tags changes. 
 */
const TagSelector = ({
    value = [],
    readOnly = false,
    onChange = undefined,
}) => {
    const [tags, setTags] = useState([]);
    const { popAlert } = useGlobalAlert();

    /**
     * Function that handles the tag changes and calls the onChange
     * callback
     * 
     * @param {*} newValue New tags
     * @param {*} reason Reason for the tag change
     */
    const handleTagChange = (_, newValue, reason) => {
        if (reason === "clear") {
           if (onChange !== undefined) onChange([]);
            return;
        }
        
        if (reason === "removeOption") {
            if (onChange !== undefined) onChange(newValue);
            return;
        }

        // If the tags' array changes because a new one was added to it, we check
        // if this tag is a totally new one (and add it to the available tags set)
        // or if the tag is already in the set (AutoComplete does it, but we are working
        // with objects and it gets confused with reference values)
        const lastVal = newValue[newValue.length - 1];
        if (lastVal.inputValue !== undefined) {
            const posVal = lastVal.inputValue.trim();
            if (!isValidTag(posVal))
                return;

            newValue[newValue.length - 1] = { tag: posVal };
            setTags(tags.concat([{ tag: posVal }]));
        }
        else if (value.some((t) => t.tag === lastVal.tag) && onChange !== undefined) {
            onChange(newValue.filter((t) => t.tag !== lastVal.tag));
            return;
        }

        if (onChange !== undefined) onChange(newValue);
    };

    
    // Effect used to retrieve all tags from the backend.
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const r = await getAllTags();
                if (!r.ok) {
                    popAlert("Problem retrieving tags", "warning");
                    return;
                }

                const tags = await r.json();
                setTags(
                    tags.map((t) => {
                        return { tag: t };
                    })
                );
            } catch {
                popAlert("Problem retrieving tags", "warning");
            }
        };

        fetchTags();
    }, [popAlert, setTags]);


    return (
        <Autocomplete
            multiple
            freeSolo
            clearOnBlur
            selectOnFocus
            value={value}
            options={tags}
            readOnly={readOnly}
            disabled={readOnly}
            onChange={handleTagChange}
            filterOptions={commonTagFilter}
            getOptionLabel={defaultGetOptionLabel}
            renderOption={(props, option) => <li {...props}>{option.tag}</li>}
            renderInput={(params) => (
                <TextField
                    variant={readOnly ? "standard" : "outlined"}
                    className={readOnly ? "input-disabled" : ""}
                    {...params}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") e.stopPropagation();
                    }}
                    label="Tags"
                />
            )}
        />
    );
};

export default TagSelector;
