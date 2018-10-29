import csv
with open('out.tsv', 'rb') as csvfile:
	r = csv.reader(csvfile, delimiter='\t')
	a = [row for row in r]
	print len(a)
