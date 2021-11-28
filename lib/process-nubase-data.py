#!/usr/bin/python
import re, sys

# Confirm arguments
if len(sys.argv) != 2:
    print("Provide path to NuBase dataset")
    exit(1)

# Read NuBase dataset or fail
fname = sys.argv[1]
try:
    with open(fname) as f:
        lines = f.readlines()
except IOError:
    print(f"File '{fname}' doesn't exist")
    exit(1)

# Find the first line of data (doesn't start with "#")
idx = 0
while idx < len(lines):
    if lines[idx][0] != "#":
        break
    idx += 1

# Define offsets for the data we want to extract
# These offsets are defined in the NuBase data file indexed from
# 1, not 0, so we define them initially 1-indexed for ease and
# then subtract 1 from each for use.
offsets = {
    "massNumber": (1, 3),
    "atomicNumber": (5, 7),
    "isIsomer": (8, 8),
    "halfLifeQty": (70, 78),
    "halfLifeUnit": (79, 80),
}
for key in offsets.keys():
    offsets[key] = (offsets[key][0] - 1, offsets[key][1])

# Define time multipliers
yearSeconds = 86400 * 365
timeMultipliers = {
    "ys": 1E-24,
    "zs": 1E-21,
    "as": 1E-18,
    "fs": 1E-15,
    "ps": 1E-12,
    "ns": 1E-9,
    "us": 1E-6,
    "ms": 1E-3,
    "s": 1,
    "m": 60,
    "h": 3600,
    "d": 86400,
    "y": yearSeconds,
    "ky": yearSeconds * 1E3,
    "My": yearSeconds * 1E6,
    "Gy": yearSeconds * 1E9,
    "Ty": yearSeconds * 1E12,
    "Py": yearSeconds * 1E15,
    "Ey": yearSeconds * 1E18,
    "Zy": yearSeconds * 1E21,
    "Yy": yearSeconds * 1E24,
}
    
# Loop through lines to build a list of parsed lines
parsedLines = []
for line in lines[idx:]: # idx+20
    
    # Skip isomers
    if line[offsets["isIsomer"][0]:offsets["isIsomer"][1]] != "0":
        continue
    
    # Collect and initially parse values
    massNumber = int(line[offsets["massNumber"][0]:offsets["massNumber"][1]].strip())
    atomicNumber = int(line[offsets["atomicNumber"][0]:offsets["atomicNumber"][1]].strip())
    halfLifeQty = line[offsets["halfLifeQty"][0]:offsets["halfLifeQty"][1]].strip()
    halfLifeUnit = line[offsets["halfLifeUnit"][0]:offsets["halfLifeUnit"][1]].strip()

    # Skip any nuclides that are not explicitly stable or have
    # a numeric half life
    if halfLifeQty == "p-unst" or halfLifeQty == "":
        continue
    
    # Determine proton and neutron numbers
    protons = atomicNumber
    neutrons = massNumber - atomicNumber

    # Normalize half life values
    if halfLifeQty == "stbl":
        halflife = "infinity"
    else:
        if halfLifeUnit not in timeMultipliers.keys():
            print(f"Unrecognized half life unit: '{halfLifeUnit}'")
            raise Exception("Unable to parse; check half life units")
        halflife = re.sub("[<>#~]", "", halfLifeQty)
        sigFigs = len(halflife.replace(".", ""))
        halflife = float(halflife) * timeMultipliers[halfLifeUnit]
        halflife = '{:g}'.format(float('{:.{p}g}'.format(halflife, p=sigFigs))) \
                   .replace("e", "E") \
                   .replace("-0", "-") \
                   .replace("+0", "+")
    
    # Apply to parsedLines
    parsedLines.append([
        str(protons),
        str(neutrons),
        str(halflife),
    ])

# Sort parsedLines by protons
parsedLines.sort(key=lambda y: int(y[0]))

# Generate final CSV
csvContent = "protons,neutrons,halflife,caption\n"
for line in parsedLines:
    csvContent += ",".join(line) + "\n"
csv = open("nuclides.csv", "w")
csv.write(csvContent)
csv.close()

print("NUBASE DATA PARSED SUCCESSFULLY")
print("Nuclides:", len(parsedLines), "CSV length:", len(csvContent))

