#!/bin/bash
mkdir -p output_tables_csv
HEADER="FrameNumber,Timestamp,SrcIP,DstIP,UDPLength,PayloadHex"

for file in pcap/*.pcap; do
    [ -e "$file" ] || continue
    filename=$(basename "$file")
    outfile="csv/${filename%.*}.csv"
    echo "Processing $file -> $outfile"
    echo "$HEADER" > "$outfile"
    tshark -r "$file" -T fields -E separator=, \
        -e frame.number \
        -e frame.time_epoch \
        -e ip.src \
        -e ip.dst \
        -e udp.length \
        -e data >> "$outfile"
done
