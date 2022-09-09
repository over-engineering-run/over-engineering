"""utils for loading nlp pipeline resources"""

import json


def load_stop_word_set(file_path: str) -> set:

    """
    load stop words and return the word set;
    stop words in the input file should be separated by '\n'
    """

    res_set = set()

    with open(file_path, 'r') as infile:
        for line in infile:
            line = line.strip().lower()
            if line:
                res_set.add(line)

    return res_set


def load_syn_map(file_path: str) -> (dict, dict):

    """load synonym json and build syn_map and inv_syn_map"""

    # syn map
    with open(file_path, 'r') as infile:
        raw_syn_map = json.load(infile)

    syn_map = {}
    for k in raw_syn_map:

        chosen_syn = k.lower().strip()

        syn_list = []
        for raw_syn in raw_syn_map[k]:
            syn = raw_syn.lower().strip()
            syn_list.append(syn)

        syn_map[chosen_syn] = syn_list

    # inverted syn map
    inv_syn_map = {}
    for chosen_syn, syn_list in syn_map.items():
        for syn in syn_list:
            inv_syn_map[syn] = chosen_syn

    return syn_map, inv_syn_map
